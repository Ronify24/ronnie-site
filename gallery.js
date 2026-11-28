        /* Lumify Gallery: versioned screenshot collections. */
        const galleryPanel = document.getElementById("panel-workspace");
        const galleryWindow = galleryPanel.querySelector(".lumify-gallery-window");
        const galleryChrome = document.getElementById("lumifyGalleryChrome");
        const galleryMaximize = document.getElementById("lumifyGalleryMaximize");
        const galleryStage = document.getElementById("lumifyGalleryStage");
        const galleryImage = document.getElementById("lumifyGalleryImage");
        const galleryImageToggle = document.getElementById("lumifyGalleryImageToggle");
        const galleryPhoneLandscape = window.matchMedia("(orientation: landscape) and (max-height: 500px) and (pointer: coarse)");
        const galleryViewport = window.visualViewport;
        const galleryStatus = document.getElementById("lumifyGalleryStatus");
        const galleryEmpty = document.getElementById("lumifyGalleryEmpty");
        const galleryPrev = document.getElementById("lumifyGalleryPrev");
        const galleryNext = document.getElementById("lumifyGalleryNext");
        const galleryFrame = document.getElementById("lumifyGalleryFrame");
        const galleryCount = document.getElementById("lumifyGalleryCount");
        const galleryThumbs = document.getElementById("lumifyGalleryThumbs");
        const gallerySiteChrome = document.querySelectorAll(".site-header, .site-footer, .skip-link");
        let galleryFiles = window.lumifyGalleryFiles || [];
        let galleryManifestRequest;
        let galleryLoadSequence = 0;
        let galleryItems = [];
        let galleryCurrent = 0;
        let galleryVersion = "v2";
        const galleryVersionButtons = document.querySelectorAll("[data-gallery-version]");
        let gallerySwipeStartX = null;
        let gallerySwipeCurrentX = null;
        let galleryZoom = 1;
        let galleryPanX = 0;
        let galleryPanY = 0;
        let galleryGesture = null;
        let galleryImagePress = null;
        let galleryImageDragged = false;
        const galleryPointers = new Map();
        const galleryMaxZoom = 4;

        function discoverGalleryImages() {
            const first = ["Workspace", "Shots", "Cut", "Assets", "Reference"];
            const folder = `/gallery/${galleryVersion}/`;
            const paths = new Set(galleryFiles);
            const url = path => '.' + path.split('/').map(encodeURIComponent).join('/');
            return galleryFiles.filter(path => path.startsWith(folder) && !path.slice(folder.length).includes('/') && /\.(png|jpe?g|webp|avif|gif)$/i.test(path))
                .map(path => {
                    const stem = path.slice(folder.length).replace(/\.[^.]+$/, '');
                    const thumbnail = `${folder}thumbnails/${stem}.webp`;
                    const src = url(path);
                    return {src, thumbnail: paths.has(thumbnail) ? url(thumbnail) : src, name: stem.replace(/^lumify_v\d+_/, '')};
                })
                .sort((a, b) => {
                    const rank = item => galleryVersion === 'v2' && first.includes(item.name) ? first.indexOf(item.name) : 100;
                    return rank(a) - rank(b) || a.name.localeCompare(b.name, undefined, {numeric: true});
                }).map((item, i) => ({...item, index: i + 1, name: item.name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}));
        }

        function loadGalleryManifest() {
            if (!galleryManifestRequest) galleryManifestRequest = fetch('./gallery/manifest.json', {cache: 'no-store'})
                .then(response => { if (!response.ok) throw new Error('Manifest unavailable'); return response.json(); })
                .then(paths => { if (Array.isArray(paths) && paths.every(path => typeof path === 'string')) galleryFiles = paths; })
                .catch(() => { /* Plain local servers use the generated preview fallback. */ });
            return galleryManifestRequest;
        }

        function selectGalleryVersion(version) {
            galleryVersion = version;
            galleryCurrent = 0;
            galleryVersionButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.galleryVersion === version)));
            ensureGalleryReady();
        }

        function getGalleryImageBounds(scale = galleryZoom) {
            const rect = galleryImage.parentElement.getBoundingClientRect();
            const imageRatio = galleryImage.naturalWidth && galleryImage.naturalHeight
                ? galleryImage.naturalWidth / galleryImage.naturalHeight
                : 3600 / 1948;
            const frameRatio = rect.width / Math.max(rect.height, 1);
            const baseWidth = frameRatio > imageRatio ? rect.height * imageRatio : rect.width;
            const baseHeight = frameRatio > imageRatio ? rect.height : rect.width / imageRatio;
            return {
                rect,
                maxX: Math.max(0, (baseWidth * scale - rect.width) / 2),
                maxY: Math.max(0, (baseHeight * scale - rect.height) / 2)
            };
        }

        function applyGalleryZoom() {
            const bounds = getGalleryImageBounds();
            galleryPanX = Math.max(-bounds.maxX, Math.min(bounds.maxX, galleryPanX));
            galleryPanY = Math.max(-bounds.maxY, Math.min(bounds.maxY, galleryPanY));
            galleryImage.style.setProperty("--gallery-zoom", String(galleryZoom));
            galleryImage.style.setProperty("--gallery-pan-x", `${galleryPanX}px`);
            galleryImage.style.setProperty("--gallery-pan-y", `${galleryPanY}px`);
            galleryStage.classList.toggle("is-zoomed", galleryZoom > 1.01);
        }

        function resetGalleryZoom() {
            galleryZoom = 1;
            galleryPanX = 0;
            galleryPanY = 0;
            galleryGesture = null;
            gallerySwipeStartX = null;
            gallerySwipeCurrentX = null;
            galleryPointers.clear();
            galleryStage.classList.remove("is-zooming", "is-zoomed");
            applyGalleryZoom();
        }

        function getGalleryPointerPair() {
            return Array.from(galleryPointers.values()).slice(0, 2);
        }

        function getPointerDistance(points) {
            return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        }

        function getPointerMidpoint(points, rect) {
            return {
                x: ((points[0].x + points[1].x) / 2) - (rect.left + rect.width / 2),
                y: ((points[0].y + points[1].y) / 2) - (rect.top + rect.height / 2)
            };
        }

        function updateGalleryImageToggle() {
            const maximized = galleryPanel.classList.contains("is-maximized");
            const imageReady = galleryImage.complete && galleryImage.naturalWidth > 0;
            galleryImageToggle.hidden = !maximized && !(imageReady && galleryPhoneLandscape.matches);
            galleryImageToggle.setAttribute("aria-expanded", String(!galleryChrome.hidden));
            galleryImageToggle.setAttribute("aria-label", !maximized ? "View image fullscreen" :
                galleryChrome.hidden ? "Show gallery controls" : "Hide gallery controls");
        }

        function setGalleryControlsHidden(hidden) {
            const moveFocus = hidden && galleryChrome.contains(document.activeElement);
            galleryChrome.hidden = hidden;
            updateGalleryImageToggle();
            if (moveFocus) galleryImageToggle.focus({ preventScroll: true });
        }

        function exitGalleryFullscreen() {
            if (document.fullscreenElement === galleryWindow) return document.exitFullscreen().catch(() => {});
        }

        function fitGalleryViewport() {
            const useVisualViewport = !galleryPanel.hidden &&
                galleryPanel.classList.contains("is-maximized") &&
                galleryPhoneLandscape.matches && document.fullscreenElement !== galleryWindow &&
                galleryViewport?.width > 0 && galleryViewport.height > 0;
            const bounds = {
                "left": galleryViewport?.offsetLeft,
                "top": galleryViewport?.offsetTop,
                "width": galleryViewport?.width,
                "height": galleryViewport?.height
            };
            for (const [edge, pixels] of Object.entries(bounds)) {
                const property = `--gallery-viewport-${edge}`;
                if (useVisualViewport) galleryPanel.style.setProperty(property, `${pixels}px`);
                else galleryPanel.style.removeProperty(property);
            }
        }

        function setGalleryMaximized(isMaximized, controlsHidden = false) {
            resetGalleryZoom();
            galleryPanel.classList.toggle("is-maximized", isMaximized);
            fitGalleryViewport();
            setGalleryControlsHidden(controlsHidden);
            gallerySiteChrome.forEach(element => { element.inert = isMaximized; });
            galleryMaximize.setAttribute("aria-pressed", isMaximized ? "true" : "false");
            const maximizeLabel = isMaximized ? "Exit image fullscreen" : "View image fullscreen";
            galleryMaximize.setAttribute("aria-label", maximizeLabel);
            galleryMaximize.title = maximizeLabel;
            if (isMaximized) {
                const focusTarget = controlsHidden ? galleryImageToggle : galleryMaximize;
                focusTarget.focus({ preventScroll: true });
            } else {
                exitGalleryFullscreen();
            }
        }

        function renderGalleryThumbs() {
            galleryThumbs.innerHTML = "";
            galleryItems.forEach((item, index) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "lumify-gallery-thumb";
                button.dataset.galleryIndex = String(index);
                button.setAttribute("aria-label", `Show Lumify ${galleryVersion.toUpperCase()} ${item.name || "gallery image " + (index + 1)}`);

                const image = document.createElement("img");
                image.src = item.thumbnail;
                image.alt = "";
                image.loading = "eager";
                image.fetchPriority = "low";
                image.decoding = "async";
                button.appendChild(image);
                galleryThumbs.appendChild(button);
            });
        }

        function renderGalleryImage() {
            if (!galleryItems.length) return;
            resetGalleryZoom();
            const item = galleryItems[galleryCurrent];
            galleryStage.classList.add("is-switching");
            galleryStatus.hidden = galleryImage.naturalWidth > 0;
            if (!galleryStatus.hidden) galleryStatus.querySelector("span").textContent = "Loading screenshot…";
            galleryImage.onload = () => {
                galleryStage.classList.remove("is-switching");
                galleryStatus.hidden = true;
                updateGalleryImageToggle();
            };
            galleryImage.onerror = () => {
                galleryStage.classList.remove("is-switching");
                updateGalleryImageToggle();
                galleryStatus.hidden = false;
                galleryStatus.querySelector("span:last-child").textContent = "This frame could not be loaded.";
            };
            galleryImage.src = item.src;
            galleryImage.alt = `Lumify ${galleryVersion.toUpperCase()} ${item.name || "creative platform interface"}, gallery view ${galleryCurrent + 1} of ${galleryItems.length}`;
            updateGalleryImageToggle();
            galleryFrame.textContent = item.name;
            galleryCount.textContent = `${String(galleryCurrent + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
            galleryEmpty.hidden = true;
            galleryPrev.disabled = galleryItems.length < 2;
            galleryNext.disabled = galleryItems.length < 2;

            galleryThumbs.querySelectorAll(".lumify-gallery-thumb").forEach((thumb, index) => {
                const isActive = index === galleryCurrent;
                thumb.classList.toggle("is-active", isActive);
                if (isActive) thumb.setAttribute("aria-current", "true");
                else thumb.removeAttribute("aria-current");
            });
        }

        function cycleGallery(delta) {
            if (galleryItems.length < 2) return;
            galleryCurrent = (galleryCurrent + delta + galleryItems.length) % galleryItems.length;
            renderGalleryImage();
        }

        function renderGalleryCollection(items) {
            galleryItems = items;
            if (!items.length) {
                galleryThumbs.innerHTML = "";
                galleryImage.removeAttribute("src");
                updateGalleryImageToggle();
                galleryFrame.textContent = "Interface screenshots";
                galleryCount.textContent = "00 / 00";
                galleryStatus.hidden = true;
                galleryEmpty.hidden = false;
                galleryPrev.disabled = true;
                galleryNext.disabled = true;
                return;
            }
            galleryCurrent = Math.min(galleryCurrent, items.length - 1);
            renderGalleryThumbs();
            renderGalleryImage();
        }

        async function ensureGalleryReady() {
            const sequence = ++galleryLoadSequence;
            const items = discoverGalleryImages();
            if (items.length) renderGalleryCollection(items);
            else {
                galleryStatus.querySelector("span").textContent = "Preparing the gallery…";
                galleryStatus.hidden = false;
                galleryEmpty.hidden = true;
            }
            await loadGalleryManifest();
            if (sequence !== galleryLoadSequence || galleryPanel.hidden) return;
            const updated = discoverGalleryImages();
            if (!updated.length || updated.length !== items.length ||
                updated.some((item, index) => item.src !== items[index].src || item.thumbnail !== items[index].thumbnail)) {
                const currentSrc = galleryItems[galleryCurrent]?.src;
                galleryCurrent = Math.max(0, updated.findIndex(item => item.src === currentSrc));
                renderGalleryCollection(updated);
            }
        }

        galleryVersionButtons.forEach(button => button.addEventListener("click", () => selectGalleryVersion(button.dataset.galleryVersion)));
        galleryMaximize.addEventListener("click", () => setGalleryMaximized(!galleryPanel.classList.contains("is-maximized")));
        galleryImageToggle.addEventListener("click", event => {
            if (event.detail && galleryImageDragged) return;
            const maximized = galleryPanel.classList.contains("is-maximized");
            if (maximized && galleryChrome.hidden) {
                setGalleryControlsHidden(false);
                return;
            }
            if (maximized) {
                if (galleryPhoneLandscape.matches) resetGalleryZoom();
                setGalleryControlsHidden(true);
            } else {
                setGalleryMaximized(true, true);
            }
            if (galleryPhoneLandscape.matches && document.fullscreenEnabled && !document.fullscreenElement) {
                galleryWindow.requestFullscreen({ navigationUI: "hide" }).catch(() => { /* Keep the viewport-sized viewer. */ });
            }
        });
        galleryWindow.addEventListener("fullscreenchange", () => {
            fitGalleryViewport();
            if (galleryPanel.hidden || !galleryPanel.classList.contains("is-maximized")) exitGalleryFullscreen();
            else if (document.fullscreenElement !== galleryWindow) setGalleryControlsHidden(false);
        });
        galleryPhoneLandscape.addEventListener("change", () => {
            updateGalleryImageToggle();
            fitGalleryViewport();
        });
        galleryViewport?.addEventListener("resize", fitGalleryViewport);
        galleryViewport?.addEventListener("scroll", fitGalleryViewport);
        galleryPrev.addEventListener("click", () => cycleGallery(-1));
        galleryNext.addEventListener("click", () => cycleGallery(1));

        galleryThumbs.addEventListener("click", (event) => {
            const button = event.target.closest("[data-gallery-index]");
            if (!button) return;
            galleryCurrent = Number(button.dataset.galleryIndex);
            renderGalleryImage();
        });

        galleryPanel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                cycleGallery(-1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                cycleGallery(1);
            } else if (event.key === "Escape" && galleryPanel.classList.contains("is-maximized")) {
                event.preventDefault();
                setGalleryMaximized(false);
                galleryMaximize.focus({ preventScroll: true });
            }
        });

        galleryStage.addEventListener("pointerdown", (event) => {
            const imagePressed = event.target === galleryImageToggle;
            if (event.target.closest("button") && !imagePressed) return;
            if (!galleryPointers.size) {
                galleryImagePress = imagePressed ? { x: event.clientX, y: event.clientY } : null;
                galleryImageDragged = false;
            }
            if (event.pointerType !== "touch" && !(galleryPanel.classList.contains("is-maximized") && galleryZoom > 1)) return;
            galleryPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            // Keep the image button as the click target for a captured tap.
            try { (imagePressed ? galleryImageToggle : galleryStage).setPointerCapture(event.pointerId); } catch { }

            if (galleryPointers.size >= 2) {
                galleryImageDragged = true;
                event.preventDefault();
                const points = getGalleryPointerPair();
                const bounds = getGalleryImageBounds();
                galleryGesture = {
                    type: "pinch",
                    distance: Math.max(getPointerDistance(points), 1),
                    zoom: galleryZoom,
                    panX: galleryPanX,
                    panY: galleryPanY,
                    midpoint: getPointerMidpoint(points, bounds.rect)
                };
                gallerySwipeStartX = null;
                gallerySwipeCurrentX = null;
                galleryStage.classList.add("is-zooming");
            } else if (galleryZoom > 1.01) {
                galleryGesture = {
                    type: "pan",
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                    panX: galleryPanX,
                    panY: galleryPanY
                };
                galleryStage.classList.add("is-zooming");
            } else {
                galleryGesture = { type: "swipe", pointerId: event.pointerId };
                gallerySwipeStartX = event.clientX;
                gallerySwipeCurrentX = event.clientX;
            }
        });

        function trackGalleryImageDrag(event) {
            if (galleryImagePress && Math.hypot(event.clientX - galleryImagePress.x, event.clientY - galleryImagePress.y) >= 10) {
                galleryImageDragged = true;
            }
        }

        galleryStage.addEventListener("pointermove", (event) => {
            trackGalleryImageDrag(event);
            if (!galleryPointers.has(event.pointerId)) return;
            galleryPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (galleryGesture?.type === "pinch" && galleryPointers.size >= 2) {
                event.preventDefault();
                const points = getGalleryPointerPair();
                const bounds = getGalleryImageBounds();
                const midpoint = getPointerMidpoint(points, bounds.rect);
                const ratio = getPointerDistance(points) / galleryGesture.distance;
                galleryZoom = Math.max(1, Math.min(galleryMaxZoom, galleryGesture.zoom * ratio));
                const zoomRatio = galleryZoom / galleryGesture.zoom;
                galleryPanX = midpoint.x - zoomRatio * (galleryGesture.midpoint.x - galleryGesture.panX);
                galleryPanY = midpoint.y - zoomRatio * (galleryGesture.midpoint.y - galleryGesture.panY);
                applyGalleryZoom();
            } else if (galleryGesture?.type === "pan" && galleryGesture.pointerId === event.pointerId) {
                event.preventDefault();
                galleryPanX = galleryGesture.panX + event.clientX - galleryGesture.x;
                galleryPanY = galleryGesture.panY + event.clientY - galleryGesture.y;
                applyGalleryZoom();
            } else if (galleryGesture?.type === "swipe" && galleryGesture.pointerId === event.pointerId) {
                gallerySwipeCurrentX = event.clientX;
            }
        }, { passive: false });

        function finishGalleryPointer(event) {
            trackGalleryImageDrag(event);
            if (event.type === "pointercancel") galleryImageDragged = true;
            if (!galleryPointers.has(event.pointerId)) return;
            if (galleryGesture?.type === "swipe" && galleryGesture.pointerId === event.pointerId) {
                gallerySwipeCurrentX = event.clientX;
            }
            galleryPointers.delete(event.pointerId);

            if (galleryGesture?.type === "pinch" && galleryPointers.size === 1 && galleryZoom > 1.01) {
                const [pointer] = galleryPointers.entries();
                galleryGesture = {
                    type: "pan",
                    pointerId: pointer[0],
                    x: pointer[1].x,
                    y: pointer[1].y,
                    panX: galleryPanX,
                    panY: galleryPanY
                };
                return;
            }

            if (galleryPointers.size) return;
            galleryStage.classList.remove("is-zooming");

            if (event.type !== "pointercancel" && galleryGesture?.type === "swipe" && gallerySwipeStartX !== null && gallerySwipeCurrentX !== null) {
                const distance = gallerySwipeCurrentX - gallerySwipeStartX;
                if (Math.abs(distance) >= 48) cycleGallery(distance > 0 ? -1 : 1);
            }

            if (galleryZoom <= 1.01) resetGalleryZoom();
            galleryGesture = null;
            gallerySwipeStartX = null;
            gallerySwipeCurrentX = null;
        }

        galleryStage.addEventListener("pointerup", finishGalleryPointer);
        galleryStage.addEventListener("pointercancel", finishGalleryPointer);

        galleryImage.addEventListener("dragstart", (event) => event.preventDefault());


        function zoomGalleryAt(nextZoom, clientX, clientY) {
            const bounds = getGalleryImageBounds();
            const x = clientX - (bounds.rect.left + bounds.rect.width / 2);
            const y = clientY - (bounds.rect.top + bounds.rect.height / 2);
            nextZoom = Math.max(1, Math.min(galleryMaxZoom, nextZoom));
            const ratio = nextZoom / galleryZoom;
            galleryPanX = x - ratio * (x - galleryPanX);
            galleryPanY = y - ratio * (y - galleryPanY);
            galleryZoom = nextZoom;
            applyGalleryZoom();
        }
        galleryStage.addEventListener("wheel", event => {
            if (!galleryPanel.classList.contains("is-maximized")) return;
            event.preventDefault();
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? galleryStage.clientHeight : 1);
            zoomGalleryAt(galleryZoom * Math.exp(-Math.max(-120, Math.min(120, delta)) * .006), event.clientX, event.clientY);
        }, {passive:false});
        galleryStage.addEventListener("dblclick", event => {
            if (!galleryPanel.classList.contains("is-maximized") || galleryPhoneLandscape.matches || galleryImageDragged) return;
            zoomGalleryAt(galleryZoom > 1 ? 1 : 2, event.clientX, event.clientY);
        });
        window.addEventListener("resize", () => {
            if (!galleryPanel.hidden) resetGalleryZoom();
        });
