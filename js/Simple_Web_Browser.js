import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
    name: "Comfy.WebBrowser",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "WebViewerNode") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                const widgetDiv = document.createElement("div");
                widgetDiv.style.display = "flex";
                widgetDiv.style.flexDirection = "column";
                widgetDiv.style.width = "100%";
                
                const imageUrlWidget = this.addWidget("text", "image_url", "", () => {}, { multiline: true });
                imageUrlWidget.draw = function() {};
                imageUrlWidget.computeSize = function() { return [0, -4]; };
                
                this.addDOMWidget("browser", "div", widgetDiv);
            
                widgetDiv.innerHTML = `
                    <style>
                        .browser-bookmark-container { position: relative; }
                        .browser-bookmark-toggle { height: 30px; width: 30px; background-color: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                        .browser-bookmark-menu {
                            display: none; position: absolute; top: 100%; left: 0;
                            background-color: #333; border: 1px solid #555; border-radius: 4px;
                            width: 280px; max-height: 400px; overflow-y: auto; z-index: 100; margin-top: 4px;
                        }
                        .bm-category-summary {
                            display: flex; align-items: center; padding: 8px; font-weight: bold; cursor: pointer; background-color: #3a3a3a;
                        }
                        .bm-category-summary:hover { background-color: #454545; }
                        .bm-category-summary .bm-category-name { flex-grow: 1; }
                        .bm-category-actions { display: none; }
                        .bm-category-summary:hover .bm-category-actions { display: block; }
                        .bm-category-actions button { background: none; border: none; color: #ccc; cursor: pointer; }
                        .bm-category-bookmarks { padding-left: 10px; border-top: 1px solid #444; min-height: 5px; }
                        .browser-bookmark-item {
                            display: flex; align-items: center; padding: 8px; color: #ccc; text-decoration: none; cursor: move;
                        }
                        .browser-bookmark-item.dragging { opacity: 0.5; background: #555; }
                        .browser-bookmark-item:hover { background-color: #4a4a4a; }
                        .browser-bookmark-item .bm-icon { margin-right: 8px; pointer-events: none; }
                        .browser-bookmark-item .bm-name { flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
                        .browser-bookmark-item .bm-actions { display: none; }
                        .browser-bookmark-item:hover .bm-actions { display: flex; }
                        .browser-bookmark-item .bm-actions button { background: none; border: none; color: #ccc; cursor: pointer; padding: 2px 4px; }
                        .bm-menu-footer { padding: 8px; border-top: 1px solid #555; }
                        .bm-menu-footer button { width: 100%; padding: 6px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; }
                        .browser-image-loader { display: flex; gap: 5px; padding: 5px; background: #282828; border-top: 1px solid #555; }
                        .browser-image-loader input { flex-grow: 1; }
                        .browser-image-loader .status-icon { color: #28a745; font-weight: bold; display: none; }
                    </style>
                    <div class="browser-controls" style="padding: 5px; background: #333; display: flex; gap: 5px; flex-shrink: 0; align-items: center;">
                        <button class="browser-home-btn" title="Homepage (right-click to set)" style="background-color: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer; padding: 0 10px; height: 30px;">🏠</button>
                        <input type="text" class="browser-url-input" placeholder="https://..." style="width: 100%; background-color: #222; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 5px;" />
                        <div class="browser-bookmark-container">
                            <button class="browser-bookmark-toggle" title="Bookmarks">★</button>
                            <div class="browser-bookmark-menu"></div>
                        </div>
                        <button class="browser-go" style="background-color: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer; padding: 0 10px; height: 30px;">Go</button>
                    </div>
                    <div class="browser-image-loader">
                        <input type="text" class="browser-image-url" placeholder="Paste the image url here..." style="background-color: #222; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 5px;" />
                        <button class="browser-load-image-btn" style="background-color: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Loading pictures from url</button>
                        <span class="status-icon url-status">✓</span>
                        <button class="browser-photopea-import-btn" style="background-color: #17a2b8; color: #fff; border: none; border-radius: 4px; cursor: pointer;">From Photopea</button>
                        <span class="status-icon photopea-status">✓</span>
                    </div>
                    <iframe style="flex-grow: 1; border: none; width: 100%; height: 100%; background-color: #222;"></iframe>
                `;
                
                const urlInput = widgetDiv.querySelector(".browser-url-input");
                const goButton = widgetDiv.querySelector(".browser-go");
                const bookmarkContainer = widgetDiv.querySelector(".browser-bookmark-container");
                const bookmarkToggleBtn = widgetDiv.querySelector(".browser-bookmark-toggle");
                const bookmarkMenu = widgetDiv.querySelector(".browser-bookmark-menu");
                const iframe = widgetDiv.querySelector("iframe");
                const imageUrlInput = widgetDiv.querySelector(".browser-image-url");
                const loadImageBtn = widgetDiv.querySelector(".browser-load-image-btn");
                const urlStatusIcon = widgetDiv.querySelector(".url-status");
                const photopeaImportBtn = widgetDiv.querySelector(".browser-photopea-import-btn");
                const photopeaStatusIcon = widgetDiv.querySelector(".photopea-status");

                let bookmarkData = [];
                let draggedItemInfo = null;

                const homeButton = widgetDiv.querySelector(".browser-home-btn");
                let homeUrl = localStorage.getItem("customHomepage") || "https://www.photopea.com";

                homeButton.addEventListener("click", () => {
                    navigate(homeUrl);
                });

                homeButton.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    const newHomeUrl = prompt("Enter your new homepage URL:", homeUrl);
                    if (newHomeUrl && newHomeUrl.trim()) {
                        homeUrl = newHomeUrl.trim();
                        localStorage.setItem("customHomepage", homeUrl);
                        alert("Homepage updated!");
                    }
                });

                const navigate = (url) => {
                    if (url && !url.startsWith("http")) url = "https://" + url;
                    if (url) { urlInput.value = url; iframe.src = url; }
                };

                navigate(homeUrl);
                
                loadImageBtn.addEventListener("click", () => {
                    const imageUrl = imageUrlInput.value.trim();
                    if(imageUrl){
                        imageUrlWidget.value = imageUrl;
                        urlStatusIcon.style.display = "inline";
                        setTimeout(() => { urlStatusIcon.style.display = "none"; }, 2000);
                    }
                });

                imageUrlInput.addEventListener("input", () => {
                    if(imageUrlInput.value.trim() === ""){
                        imageUrlWidget.value = "";
                    }
                });

                photopeaImportBtn.addEventListener("click", () => {
                    photopeaImportBtn.textContent = "Getting...";
                    photopeaImportBtn.disabled = true;
                    iframe.contentWindow.postMessage("app.activeDocument.saveToOE('png');", "*");
                });

                const handlePhotopeaMessage = async (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        try {
                            const blob = new Blob([event.data], { type: "image/png" });
                            const formData = new FormData();
                            const filename = `photopea_export_${Date.now()}.png`;
                            formData.append('image', blob, filename);
                            
                            const response = await api.fetchApi('/browser/upload_temp_image', { method: 'POST', body: formData });
                            const result = await response.json();
                            
                            if (result.name) {
                                imageUrlWidget.value = result.name;
                                photopeaStatusIcon.style.display = "inline";
                                setTimeout(() => { photopeaStatusIcon.style.display = "none"; }, 2000);
                            } else {
                                throw new Error("Upload failed, no filename returned.");
                            }
                        } catch (e) {
                            console.error("Error processing image from Photopea:", e);
                            alert("Image import from photopea failed, please check the console for more information.");
                        } finally {
                            photopeaImportBtn.textContent = "From Photopea";
                            photopeaImportBtn.disabled = false;
                        }
                    }
                };
                
                window.addEventListener("message", handlePhotopeaMessage);
                const onRemoved = this.onRemoved;
                this.onRemoved = () => {
                    window.removeEventListener("message", handlePhotopeaMessage);
                    return onRemoved ? onRemoved.apply(this, arguments) : undefined;
                };

                const renderBookmarks = () => {
                    bookmarkMenu.innerHTML = "";
                    
                    const addItem = document.createElement("a");
                    addItem.href = "#";
                    addItem.className = "browser-bookmark-item add-bookmark-btn";
                    addItem.innerHTML = `<span class="bm-icon">+</span><span class="bm-name">Add the current URL</span>`;
                    addItem.onclick = (e) => {
                        e.preventDefault();
                        const url = urlInput.value.trim();
                        if (!url) { alert("The address bar is empty."); return; }
                        const name = prompt("Enter a name for this bookmark:", url);
                        if (name && name.trim()) {
                            if (bookmarkData.length === 0) {
                                bookmarkData.push({ categoryName: "Uncategorized", bookmarks: [] });
                            }
                            bookmarkData[0].bookmarks.push({ name: name.trim(), url: url });
                            syncBookmarks();
                        }
                        bookmarkMenu.style.display = "none";
                    };
                    bookmarkMenu.appendChild(addItem);

                    bookmarkData.forEach((category, categoryIndex) => {
                        const categoryDetails = document.createElement("details");
                        categoryDetails.open = true;
                        categoryDetails.dataset.categoryIndex = categoryIndex;

                        const summary = document.createElement("summary");
                        summary.className = "bm-category-summary";
                        summary.innerHTML = `<span class="bm-category-name">${category.categoryName}</span><div class="bm-category-actions"><button class="bm-add-here" title="Add current URL to this category">+</button><button class="bm-cat-edit" title="Rename category">✏️</button><button class="bm-cat-delete" title="Delete category">🗑️</button></div>`;
                        
                        summary.querySelector(".bm-add-here").addEventListener("click", (e) => {
                           e.preventDefault();
                           const url = urlInput.value.trim();
                           if (!url) { alert("The address bar is empty."); return; }
                           const name = prompt("Enter a name for the bookmark:", url);
                           if (name && name.trim()) {
                               bookmarkData[categoryIndex].bookmarks.push({ name: name.trim(), url: url });
                               syncBookmarks();
                           }
                        });
                        summary.querySelector(".bm-cat-edit").addEventListener("click", (e) => { e.preventDefault(); const newCatName = prompt("Enter a new category name:", category.categoryName); if (newCatName && newCatName.trim()) { bookmarkData[categoryIndex].categoryName = newCatName.trim(); syncBookmarks(); } });
                        summary.querySelector(".bm-cat-delete").addEventListener("click", (e) => { e.preventDefault(); if (confirm(`Confirm to delete the category "${category.categoryName}" And all of its bookmarks?`)) { bookmarkData.splice(categoryIndex, 1); syncBookmarks(); } });

                        const bookmarkList = document.createElement("div");
                        bookmarkList.className = "bm-category-bookmarks";
                        bookmarkList.dataset.categoryIndex = categoryIndex;

                        (category.bookmarks || []).forEach((bookmark, bookmarkIndex) => {
                            const item = document.createElement("a");
                            item.href = "#"; item.className = "browser-bookmark-item"; item.draggable = true;
                            item.innerHTML = `<span class="bm-icon">🌐</span><span class="bm-name" title="${bookmark.url}">${bookmark.name}</span><div class="bm-actions"><button class="bm-edit">✏️</button><button class="bm-delete">🗑️</button></div>`;
                            item.addEventListener("click", (e) => { e.preventDefault(); navigate(bookmark.url); bookmarkMenu.style.display = "none"; });
                            item.querySelector(".bm-edit").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const newName = prompt("Enter a new bookmark name:", bookmark.name); if (newName && newName.trim()) { bookmark.name = newName.trim(); syncBookmarks(); } });
                            item.querySelector(".bm-delete").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`Confirm to delete the bookmark "${bookmark.name}"?`)) { category.bookmarks.splice(bookmarkIndex, 1); syncBookmarks(); } });
                            item.addEventListener("dragstart", (e) => { e.stopPropagation(); draggedItemInfo = { categoryIndex, bookmarkIndex }; setTimeout(() => item.classList.add("dragging"), 0); });
                            item.addEventListener("dragend", (e) => { e.stopPropagation(); item.classList.remove("dragging"); });
                            item.addEventListener("dragover", (e) => { e.preventDefault(); e.stopPropagation(); });
                            item.addEventListener("drop", (e) => {
                                e.preventDefault(); e.stopPropagation();
                                if (draggedItemInfo) {
                                    const { categoryIndex: fromCatIndex, bookmarkIndex: fromBmIndex } = draggedItemInfo;
                                    const toCatIndex = categoryIndex, toBmIndex = bookmarkIndex;
                                    if(fromCatIndex === toCatIndex && fromBmIndex === toBmIndex) return;
                                    const movedItem = bookmarkData[fromCatIndex].bookmarks.splice(fromBmIndex, 1)[0];
                                    bookmarkData[toCatIndex].bookmarks.splice(toBmIndex, 0, movedItem);
                                    syncBookmarks();
                                }
                                draggedItemInfo = null;
                            });
                            bookmarkList.appendChild(item);
                        });
                        
                        const dropHandler = (e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (draggedItemInfo && draggedItemInfo.categoryIndex !== categoryIndex) {
                                const { categoryIndex: fromCatIndex, bookmarkIndex: fromBmIndex } = draggedItemInfo;
                                const movedItem = bookmarkData[fromCatIndex].bookmarks.splice(fromBmIndex, 1)[0];
                                bookmarkData[categoryIndex].bookmarks.push(movedItem);
                                syncBookmarks();
                            }
                            draggedItemInfo = null;
                        };
                        summary.addEventListener("dragover", (e) => { e.preventDefault(); e.stopPropagation(); categoryDetails.open = true; });
                        summary.addEventListener("drop", dropHandler);
                        bookmarkList.addEventListener("drop", dropHandler);
                        
                        categoryDetails.appendChild(summary);
                        categoryDetails.appendChild(bookmarkList);
                        bookmarkMenu.appendChild(categoryDetails);
                    });
                    
                    const footer = document.createElement("div"); footer.className = "bm-menu-footer";
                    const addCategoryBtn = document.createElement("button"); addCategoryBtn.textContent = "+ new category";
                    addCategoryBtn.onclick = () => { const newCatName = prompt("Enter the name of the new category:"); if (newCatName && newCatName.trim()) { bookmarkData.push({ categoryName: newCatName.trim(), bookmarks: [] }); syncBookmarks(); } };
                    footer.appendChild(addCategoryBtn);
                    bookmarkMenu.appendChild(footer);
                };

                const syncBookmarks = async () => { try { await api.fetchApi("/browser/save_bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookmarkData) }); renderBookmarks(); } catch (e) { console.error("Failed to save bookmarks:", e); } };
                bookmarkToggleBtn.addEventListener("click", () => { bookmarkMenu.style.display = bookmarkMenu.style.display === "block" ? "none" : "block"; });
                document.addEventListener("click", (e) => { if (!bookmarkContainer.contains(e.target)) bookmarkMenu.style.display = "none"; });
                goButton.addEventListener("click", () => navigate(urlInput.value.trim()));
                urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") navigate(urlInput.value.trim()); });

                this.onResize = function(size) {
                    const minHeight = 470;
                    const minWidth = 700;
                    if (size[1] < minHeight) size[1] = minHeight;
                    if (size[0] < minWidth) size[0] = minWidth;
                    widgetDiv.style.height = `${size[1] - 70}px`;
                };

                this.size = [900, 770];

                (async () => {
                    try {
                        const res = await api.fetchApi("/browser/get_bookmarks");
                        bookmarkData = await res.json();
                        renderBookmarks();
                    } catch (e) { console.error("Failed to load bookmarks:", e); }
                    setTimeout(() => { this.onResize(this.size); }, 1);
                })();
                
                return r;
            };
        }
    },
});