        /* Lumify Gallery: versioned screenshot collections. */
        const galleryDialog = document.getElementById("lumifyGalleryDialog");
        const galleryLaunch = document.getElementById("lumifyGalleryLaunch");
        const galleryClose = document.getElementById("lumifyGalleryClose");
        const galleryMaximize = document.getElementById("lumifyGalleryMaximize");
        const galleryStage = document.getElementById("lumifyGalleryStage");
        const galleryImage = document.getElementById("lumifyGalleryImage");
        const galleryStatus = document.getElementById("lumifyGalleryStatus");
        const galleryEmpty = document.getElementById("lumifyGalleryEmpty");
        const galleryPrev = document.getElementById("lumifyGalleryPrev");
        const galleryNext = document.getElementById("lumifyGalleryNext");
        const galleryCount = document.getElementById("lumifyGalleryCount");
        const galleryThumbs = document.getElementById("lumifyGalleryThumbs");
        const galleryExtensions = ["png", "jpg", "jpeg", "webp"];
        const galleryProbeLimit = 80;
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
        const galleryPointers = new Map();
        const galleryMaxZoom = 4;

        function discoverGalleryImages() {
            if (galleryVersion === "v2") return ["Workspace", "Shots", "Cut", "Assets", "Reference"].map((name, i) => ({src: `./gallery/v2/lumify_v2_${name}.png`, index: i + 1, name}));
            return Array.from({length: 11}, (_, i) => ({src: `./gallery/${i + 1}_gallery.webp`, index: i + 1}));
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

        function setGalleryMaximized(isMaximized) {
            resetGalleryZoom();
            galleryDialog.classList.toggle("is-maximized", isMaximized);
            if (isMaximized) galleryDialog.setAttribute("aria-label", "Lumify precision image viewer");
            else galleryDialog.removeAttribute("aria-label");
            galleryMaximize.innerHTML = isMaximized
                ? '<i class="fa-solid fa-compress" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-expand" aria-hidden="true"></i>';
            galleryMaximize.setAttribute("aria-pressed", isMaximized ? "true" : "false");
            galleryMaximize.setAttribute("aria-label", isMaximized ? "Restore gallery window" : "Maximize gallery window");
            galleryMaximize.title = isMaximized ? "Restore window" : "Maximize window";
            galleryClose.setAttribute("aria-label", isMaximized ? "Close precision viewer" : "Close Lumify Gallery");
            galleryClose.title = isMaximized ? "Close precision viewer" : "Close gallery";
            if (isMaximized) requestAnimationFrame(() => galleryClose.focus({ preventScroll: true }));
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
                image.src = item.src;
                image.alt = "";
                image.loading = "eager";
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
            galleryImage.onload = () => galleryStage.classList.remove("is-switching");
            galleryImage.onerror = () => {
                galleryStage.classList.remove("is-switching");
                galleryStatus.hidden = false;
                galleryStatus.querySelector("span:last-child").textContent = "This frame could not be loaded.";
            };
            galleryImage.src = item.src;
            galleryImage.alt = `Lumify ${galleryVersion.toUpperCase()} ${item.name || "creative platform interface"}, gallery view ${galleryCurrent + 1} of ${galleryItems.length}`;
            galleryCount.textContent = `${String(galleryCurrent + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
            galleryStatus.hidden = true;
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

        function ensureGalleryReady() {
            galleryStatus.hidden = false;
            galleryEmpty.hidden = true;
            galleryItems = discoverGalleryImages();
            if (!galleryItems.length) {
                galleryStatus.hidden = true;
                galleryEmpty.hidden = false;
                galleryPrev.disabled = true;
                galleryNext.disabled = true;
                return;
            }
            galleryCurrent = Math.min(galleryCurrent, galleryItems.length - 1);
            renderGalleryThumbs();
            renderGalleryImage();
        }

        let galleryReturnFocus;
        async function openGallery(event) {
            galleryReturnFocus = event?.currentTarget;
            if (!galleryDialog.open) galleryDialog.showModal();
            document.body.classList.add("gallery-is-open");
            document.querySelectorAll("[data-gallery]").forEach(button => button.setAttribute("aria-expanded", "true"));
            galleryClose.focus({ preventScroll: true });
            selectGalleryVersion("v2");
        }

        document.querySelectorAll("[data-gallery]").forEach(button => button.addEventListener("click", openGallery));
        galleryVersionButtons.forEach(button => button.addEventListener("click", () => selectGalleryVersion(button.dataset.galleryVersion)));
        galleryClose.addEventListener("click", () => galleryDialog.close());
        galleryMaximize.addEventListener("click", () => setGalleryMaximized(!galleryDialog.classList.contains("is-maximized")));
        galleryPrev.addEventListener("click", () => cycleGallery(-1));
        galleryNext.addEventListener("click", () => cycleGallery(1));

        galleryThumbs.addEventListener("click", (event) => {
            const button = event.target.closest("[data-gallery-index]");
            if (!button) return;
            galleryCurrent = Number(button.dataset.galleryIndex);
            renderGalleryImage();
        });

        galleryDialog.addEventListener("click", (event) => {
            if (event.target === galleryDialog) galleryDialog.close();
        });

        galleryDialog.addEventListener("close", () => {
            document.body.classList.remove("gallery-is-open");
            document.querySelectorAll("[data-gallery]").forEach(button => button.setAttribute("aria-expanded", "false"));
            setGalleryMaximized(false);
            galleryReturnFocus?.focus({preventScroll:true});
        });

        galleryDialog.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                cycleGallery(-1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                cycleGallery(1);
            } else if (event.key === "Escape") {
                event.preventDefault();
                galleryDialog.close();
            }
        });

        galleryStage.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;
            galleryPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            try { galleryStage.setPointerCapture(event.pointerId); } catch { }

            if (galleryPointers.size >= 2) {
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

        galleryStage.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "touch" || !galleryPointers.has(event.pointerId)) return;
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
            if (event.pointerType !== "touch") return;
            if (galleryGesture?.type === "swipe" && galleryGesture.pointerId === event.pointerId) {
                gallerySwipeCurrentX = event.clientX;
            }
            galleryPointers.delete(event.pointerId);
            try { galleryStage.releasePointerCapture(event.pointerId); } catch { }

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

