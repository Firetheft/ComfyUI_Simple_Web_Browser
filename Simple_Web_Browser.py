import server
from aiohttp import web
import os
import json
import torch
import numpy as np
from PIL import Image
import requests
import io
import folder_paths
import time

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
BOOKMARKS_FILE = os.path.join(NODE_DIR, "browser_bookmarks.json")

def load_bookmarks():
    if not os.path.exists(BOOKMARKS_FILE):
        return [{"categoryName": "Uncategorized", "bookmarks": []}]
    try:
        with open(BOOKMARKS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        migrated = False
        uncategorized_bookmarks = []
        valid_categories = [cat for cat in data if isinstance(cat, dict) and 'categoryName' in cat and 'bookmarks' in cat]
        invalid_items = [item for item in data if not (isinstance(item, dict) and 'categoryName' in item and 'bookmarks' in item)]
        if invalid_items:
            uncategorized_bookmarks.extend(invalid_items)
            migrated = True
        if not valid_categories:
            valid_categories.append({"categoryName": "Uncategorized", "bookmarks": []})
            migrated = True
        if uncategorized_bookmarks:
            valid_categories[0]['bookmarks'].extend(uncategorized_bookmarks)
        if migrated:
            save_bookmarks(valid_categories)
        return valid_categories
    except (IOError, json.JSONDecodeError):
        return [{"categoryName": "Uncategorized", "bookmarks": []}]

def save_bookmarks(data):
    try:
        with open(BOOKMARKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except IOError as e:
        print(f"WebBrowser Node: Error saving bookmarks: {e}")

class WebViewerNode:
    @classmethod
    def IS_CHANGED(s, image_url, **kwargs):
        return image_url

    @classmethod
    def INPUT_TYPES(s):
        return { "required": {}, "hidden": { "unique_id": "UNIQUE_ID", "image_url": ("STRING", {"default": "", "multiline": True}), }, }

    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("image", "mask")
    FUNCTION = "load_image"
    OUTPUT_NODE = False
    CATEGORY = "📜Asset Gallery/Utils"

    def load_image(self, unique_id, image_url=""):
        empty_image = torch.zeros(1, 1, 1, 3)
        empty_mask = torch.zeros(1, 1, 1)
        if not image_url or not image_url.strip():
            return (empty_image, empty_mask)
        
        try:
            if image_url.startswith("http://") or image_url.startswith("https://"):
                print(f"WebBrowser Node: Loading image from URL: {image_url}")
                headers = {'User-Agent': 'Mozilla/5.0'}
                response = requests.get(image_url, headers=headers, timeout=30)
                response.raise_for_status()
                img = Image.open(io.BytesIO(response.content))
            else:
                print(f"WebBrowser Node: Loading image from temp file: {image_url}")
                filename_only = os.path.basename(image_url)
                temp_dir = folder_paths.get_temp_directory()
                image_path = os.path.join(temp_dir, filename_only)
                
                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"File not found in temp directory: {image_path}")
                
                img = Image.open(image_path)
        except Exception as e:
            print(f"WebBrowser Node: Failed to load image. Error: {e}")
            return (empty_image, empty_mask)
        
        img_rgba = img.convert("RGBA")
        img_rgb = Image.new("RGB", img_rgba.size, (0, 0, 0))
        img_rgb.paste(img_rgba, mask=img_rgba.split()[3])

        mask_array = np.array(img_rgba.getchannel('A')).astype(np.float32) / 255.0
        mask = torch.from_numpy(mask_array).unsqueeze(0)

        image_array = np.array(img_rgb).astype(np.float32) / 255.0
        image = torch.from_numpy(image_array).unsqueeze(0)
        
        return (image, mask)

@server.PromptServer.instance.routes.get("/browser/get_bookmarks")
async def get_bookmarks(request):
    return web.json_response(load_bookmarks())

@server.PromptServer.instance.routes.post("/browser/save_bookmarks")
async def post_bookmarks(request):
    try:
        data = await request.json()
        save_bookmarks(data)
        return web.json_response({"status": "ok"})
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

@server.PromptServer.instance.routes.post("/browser/upload_temp_image")
async def upload_temp_image(request):
    post = await request.post()
    image_data = post.get("image")
    if not image_data:
        return web.json_response({"error": "No image data"}, status=400)
    filename = f"browser_paste_{int(time.time())}.png"
    temp_dir = folder_paths.get_temp_directory()
    filepath = os.path.join(temp_dir, filename)
    with open(filepath, 'wb') as f:
        f.write(image_data.file.read())
    response_name = os.path.join("temp", filename)
    return web.json_response({"name": response_name})

NODE_CLASS_MAPPINGS = { "WebViewerNode": WebViewerNode }
NODE_DISPLAY_NAME_MAPPINGS = { "WebViewerNode": "Simple Web Browser" }