document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. INTRO ANIMATION TRIGGERS (Fehlersicher gekapselt)
    // ==========================================================================
    setTimeout(() => {
        const vinylWrapper = document.getElementById("heroVinylWrapper");
        const workstationWrapper = document.getElementById("heroWorkstationWrapper");
        const packagingStage = document.getElementById("heroPackagingStage");
        const heroText = document.querySelector(".hero-text-entry");
        const modernMachine = document.getElementById("heroModernMachine");

        // 1a. Wenn wir auf der VINYL-Unterseite sind (Rotierende Platte)
        if (vinylWrapper) {
            vinylWrapper.classList.add("loaded");
            setTimeout(() => { vinylWrapper.classList.add("spinning"); }, 2200);
        }

        // 1b. Wenn wir auf der STARTSEITE (index.html) sind -> Flüssiges Ignition-Konzept
        if (modernMachine) {
            modernMachine.style.opacity = "1";
            modernMachine.style.transform = "scale(1)";

            const cylinders = modernMachine.querySelectorAll('.print-cylinder');
            if (cylinders.length > 0) {
                // Zünde die Zylinder nacheinander durch Klassen-Aktivierung
                cylinders.forEach((cyl, index) => {
                    setTimeout(() => {
                        cyl.classList.add('ignited');
                    }, 300 + (index * 250));
                });
            }

            // Scanner fährt aus, sobald die Zylinder glühen
            const scanner = modernMachine.querySelector('.precision-scanner');
            if (scanner) {
                setTimeout(() => {
                    scanner.style.opacity = "1";
                    scanner.style.transform = "translateY(-50%) scaleX(1)";
                    scanner.style.animation = "laserScan 3s linear infinite";
                }, 1300);
            }

            // Maus-Effekt: Farb-Dunst ausstoßen
            modernMachine.addEventListener('mouseenter', function () {
                const colors = ['#00ffff', '#ff007f', '#ffff00'];
                for (let i = 0; i < 6; i++) {
                    const mist = document.createElement('div');
                    mist.className = 'dynamic-ink-mist';
                    mist.style.backgroundColor = colors[i % colors.length];

                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 60 + Math.random() * 80;
                    const x = Math.cos(angle) * velocity;
                    const y = Math.sin(angle) * velocity;

                    mist.style.setProperty('--x', `${x}px`);
                    mist.style.setProperty('--y', `${y}px`);

                    modernMachine.appendChild(mist);

                    setTimeout(() => { mist.remove(); }, 1400);
                }
            });
        }

        // Globale Elemente aktivieren
        if (workstationWrapper) { workstationWrapper.classList.add("loaded"); }
        if (packagingStage) { packagingStage.classList.add("loaded"); }
        if (heroText) { heroText.classList.add("visible"); }
    }, 300);

    // ==========================================================================
    // 2. HIGH-END HOTSPOT LOGIK (Abgesichert)
    // ==========================================================================
    const hotspotPins = document.querySelectorAll('.hotspot-pin');
    const targetCards = document.querySelectorAll('.hotspot-target-card');

    function activateHotspotElement(index) {
        if (targetCards.length === 0 || hotspotPins.length === 0) return;
        targetCards.forEach(card => card.classList.remove('card-active'));
        hotspotPins.forEach(pin => pin.classList.remove('pin-active'));

        const activeCard = document.querySelector(`.hotspot-target-card[data-card-index="${index}"]`);
        const activePin = document.querySelector(`.hotspot-pin[data-target-index="${index}"]`);

        if (activeCard) activeCard.classList.add('card-active');
        if (activePin) activePin.classList.add('pin-active');
    }

    if (hotspotPins.length > 0 && targetCards.length > 0) {
        hotspotPins.forEach(pin => {
            pin.addEventListener('mouseenter', function () {
                const index = this.getAttribute('data-target-index');
                activateHotspotElement(index);
            });
        });

        targetCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                const index = this.getAttribute('data-card-index');
                activateHotspotElement(index);
            });
        });

        activateHotspotElement(0);
    }

    // ==========================================================================
    // 3. INTERACTIVE HOVER CAROUSEL CONTROL (Abgesichert)
    // ==========================================================================
    const hoverTargets = document.querySelectorAll('.hover-target');
    if (hoverTargets.length > 0) {
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', function () {
                const imgIndex = parseInt(this.getAttribute('data-img-index'), 10);
                const parentRow = this.closest('.row');
                if (!parentRow) return;

                parentRow.querySelectorAll('.hover-target').forEach(card => card.classList.remove('card-active'));
                this.classList.add('card-active');

                const carouselEl = parentRow.querySelector('.carousel');
                if (carouselEl && typeof bootstrap !== 'undefined') {
                    carouselEl.classList.remove('slide');
                    const carouselInstance = bootstrap.Carousel.getInstance(carouselEl) || new bootstrap.Carousel(carouselEl);
                    carouselInstance.to(imgIndex);

                    setTimeout(() => { carouselEl.classList.add('slide'); }, 50);
                }
            });
        });
    }

    // ==========================================================================
    // 4. HOVER DROPDOWN STEUERUNG (Navbar Schutz)
    // ==========================================================================
    const hoverDropdowns = document.querySelectorAll('.hover-dropdown');
    if (hoverDropdowns.length > 0) {
        hoverDropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', function () {
                if (window.innerWidth >= 992) { this.classList.add('show'); }
            });
            dropdown.addEventListener('mouseleave', function () {
                if (window.innerWidth >= 992) { this.classList.remove('show'); }
            });
        });
    }

    // ==========================================================================
    // 5. MOBILES DROPDOWN (Abgesichert)
    // ==========================================================================
    const mobileArrows = document.querySelectorAll('.mobile-arrow');
    if (mobileArrows.length > 0) {
        mobileArrows.forEach(arrow => {
            arrow.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                const parentLi = this.closest('.mobile-split-dropdown');
                if (!parentLi) return;
                document.querySelectorAll('.mobile-split-dropdown').forEach(li => {
                    if (li !== parentLi) { li.classList.remove('show'); }
                });
                parentLi.classList.toggle('show');
            });
        });

        document.addEventListener('click', function () {
            document.querySelectorAll('.mobile-split-dropdown').forEach(li => { li.classList.remove('show'); });
        });
    }

    // ==========================================================================
    // 6. HISTORISCHER FOTOSTAPEL (Abgesichert)
    // ==========================================================================
    const photoStack = document.getElementById('historicalPhotoStack');
    const btnNextPhoto = document.getElementById('btnNextPhoto');
    let isAnimating = false;

    function cyclePhotos() {
        if (!photoStack || isAnimating) return;
        const cards = Array.from(photoStack.querySelectorAll('.historical-photo-card'));
        if (cards.length < 2) return;
        isAnimating = true;
        const activeCard = cards.find(card => card.classList.contains('pos-1'));
        if (!activeCard) { isAnimating = false; return; }

        activeCard.classList.add('swipe-out');
        setTimeout(() => {
            cards.forEach(card => {
                if (card.classList.contains('pos-1')) { card.classList.remove('pos-1'); card.classList.add('pos-6'); }
                else if (card.classList.contains('pos-2')) { card.classList.remove('pos-2'); card.classList.add('pos-1'); }
                else if (card.classList.contains('pos-3')) { card.classList.remove('pos-3'); card.classList.add('pos-2'); }
                else if (card.classList.contains('pos-4')) { card.classList.remove('pos-4'); card.classList.add('pos-3'); }
                else if (card.classList.contains('pos-5')) { card.classList.remove('pos-5'); card.classList.add('pos-4'); }
                else if (card.classList.contains('pos-6')) { card.classList.remove('pos-6'); card.classList.add('pos-5'); }
            });
        }, 300);

        setTimeout(() => { activeCard.classList.remove('swipe-out'); isAnimating = false; }, 650);
    }

    if (photoStack) { photoStack.addEventListener('click', cyclePhotos); }
    if (btnNextPhoto) { btnNextPhoto.addEventListener('click', function (e) { e.stopPropagation(); cyclePhotos(); }); }

    // ==========================================================================
    // 7. KONTAKTFORMULAR BESTÄTIGUNG (Bereinigter AJAX-Versand + Fehler-Fallback)
    // ==========================================================================
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Wird gesendet...";
            }

            const formData = new FormData(this);

            fetch(this.action, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Das Danke-Popup öffnet sich NUR hier, wenn das Formular erfolgreich versendet wurde
                        if (typeof bootstrap !== 'undefined') {
                            const thankYouModalEl = document.getElementById('thankYouModal');
                            const thankYouModal = new bootstrap.Modal(thankYouModalEl);
                            thankYouModal.show();
                        } else {
                            alert("Danke! Ihre Nachricht wurde erfolgreich übermittelt. Wir melden uns bei Ihnen.");
                        }
                        contactForm.reset();
                    } else {
                        // Fehler-Info, falls der Server streikt
                        alert("Hoppla! Es gab ein Problem beim Absenden. Bitte senden Sie uns Ihre Anfrage direkt per E-Mail an: info@druckerei-goerner.de");
                    }
                })
                .catch(error => {
                    // Fehler-Info bei Netzwerk- oder Verbindungsfehlern
                    alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung oder senden Sie uns Ihre Anfrage direkt per E-Mail an: info@druckerei-goerner.de");
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Anfrage senden";
                    }
                });
        });
    }

    // ==========================================================================
    // 8. VINYL FORMATE SLIDESHOWS (Abgesichert)
    // ==========================================================================
    const formatsCarousels = document.querySelectorAll('.carousel');
    if (formatsCarousels.length > 0 && typeof bootstrap !== 'undefined') {
        formatsCarousels.forEach(carousel => {
            new bootstrap.Carousel(carousel, { interval: 4000, wrap: true, touch: true });
        });
    }

    // ==========================================================================
    // 9. 3D SPINE EVOLUTION (Abgesichert)
    // ==========================================================================
    const spineButtons = document.querySelectorAll('.spine-btn');
    const interactiveCover = document.getElementById('interactiveCover');
    const spineLabel = document.getElementById('spineLabel');
    const spineDescription = document.getElementById('spineDescription');

    if (interactiveCover && spineButtons.length > 0) {
        spineButtons.forEach(button => {
            button.addEventListener('click', function () {
                spineButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const thickness = this.getAttribute('data-thickness');
                const textInfo = this.getAttribute('data-text');
                interactiveCover.className = 'spine-cover-3d';
                interactiveCover.classList.add('size-' + thickness);

                if (spineLabel) {
                    if (thickness === '0') { spineLabel.textContent = '0 mm'; }
                    else if (thickness === '3') { spineLabel.textContent = '3 mm'; }
                    else if (thickness === '5') { spineLabel.textContent = '5 mm'; }
                    else if (thickness === '7') { spineLabel.textContent = '7 mm'; }
                }
                if (spineDescription) {
                    spineDescription.textContent = textInfo;
                }
            });
        });
    }

    // ==========================================================================
    // 10. VINYL-FORMULAR MIT DATEI-UPLOAD (AJAX + Modal)
    // ==========================================================================
    const vinylForm = document.getElementById("vinylContactForm");
    const vSubmitBtn = document.getElementById("vSubmitBtn");

    if (vinylForm) {
        vinylForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (vSubmitBtn) {
                vSubmitBtn.disabled = true;
                vSubmitBtn.textContent = "Wird gesendet...";
            }

            // FormData sammelt automatisch alle Textfelder UND die Datei ein
            const formData = new FormData(this);

            fetch(this.action, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                    // WICHTIG: Kein Content-Type Header bei Datei-Uploads!
                }
            })
                .then(response => {
                    if (response.ok) {
                        if (typeof bootstrap !== 'undefined') {
                            const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
                            thankYouModal.show();
                        } else {
                            alert("Danke! Ihre Vinyl-Anfrage inklusive Datei wurde erfolgreich übermittelt.");
                        }
                        vinylForm.reset();
                    } else {
                        alert("Hoppla! Es gab ein Problem beim Hochladen. Ist die Datei eventuell zu groß?");
                    }
                })
                .catch(error => {
                    alert("Netzwerkfehler beim Datei-Upload. Bitte Verbindung prüfen.");
                })
                .finally(() => {
                    if (vSubmitBtn) {
                        vSubmitBtn.disabled = false;
                        vSubmitBtn.textContent = "Vinyl-Anfrage senden";
                    }
                });
        });
    }
});