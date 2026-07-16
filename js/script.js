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

        if (vinylWrapper) {
            vinylWrapper.classList.add("loaded");
            setTimeout(() => { vinylWrapper.classList.add("spinning"); }, 2200);
        }

        if (modernMachine) {
            modernMachine.style.opacity = "1";
            modernMachine.style.transform = "scale(1)";

            const cylinders = modernMachine.querySelectorAll('.print-cylinder');
            if (cylinders.length > 0) {
                cylinders.forEach((cyl, index) => {
                    setTimeout(() => {
                        cyl.classList.add('ignited');
                    }, 300 + (index * 250));
                });
            }

            const scanner = modernMachine.querySelector('.precision-scanner');
            if (scanner) {
                setTimeout(() => {
                    scanner.style.opacity = "1";
                    scanner.style.transform = "translateY(-50%) scaleX(1)";
                    scanner.style.animation = "laserScan 3s linear infinite";
                }, 1300);
            }

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

        if (workstationWrapper) { workstationWrapper.classList.add("loaded"); }
        if (packagingStage) { packagingStage.classList.add("loaded"); }
        if (heroText) { heroText.classList.add("visible"); }
    }, 300);

    // ==========================================================================
    // 2. HIGH-END HOTSPOT LOGIK
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
    // 3. INTERACTIVE HOVER CAROUSEL CONTROL
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
    // 5. MOBILES DROPDOWN
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
    // 6. HISTORISCHER FOTOSTAPEL
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
    // 7. KONTAKTFORMULAR BESTÄTIGUNG (Görner CRM AJAX-Versand)
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
            const dataObject = {
                formType: "kontakt",
                name: formData.get("Name"),
                email: formData.get("Email"),
                phone: formData.get("Telefon"),
                subject: formData.get("Betreff"),
                message: formData.get("Nachricht")
            };

            fetch(this.action, {
                method: "POST",
                redirect: "follow",
                body: JSON.stringify(dataObject),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.erfolg === true) { 
                    if (typeof bootstrap !== 'undefined') {
                        const thankYouModalEl = document.getElementById('thankYouModal');
                        const thankYouModal = new bootstrap.Modal(thankYouModalEl);
                        thankYouModal.show();
                    } else {
                        alert("Danke! Ihre Nachricht wurde erfolgreich übermittelt.");
                    }
                    contactForm.reset();
                } else {
                    alert("Es gab ein Problem im CRM: " + data.meldung);
                }
            })
            .catch(error => {
                if (typeof bootstrap !== 'undefined') {
                    const thankYouModalEl = document.getElementById('thankYouModal');
                    const thankYouModal = new bootstrap.Modal(thankYouModalEl);
                    thankYouModal.show();
                } else {
                    alert("Danke! Ihre Nachricht wurde erfolgreich übermittelt.");
                }
                contactForm.reset();
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
    // 8. VINYL FORMATE SLIDESHOWS
    // ==========================================================================
    const formatsCarousels = document.querySelectorAll('.carousel');
    if (formatsCarousels.length > 0 && typeof bootstrap !== 'undefined') {
        formatsCarousels.forEach(carousel => {
            new bootstrap.Carousel(carousel, { interval: 4000, wrap: true, touch: true });
        });
    }

    // ==========================================================================
    // 9. 3D SPINE EVOLUTION
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
    // 10. VINYL-FORMULAR VALIDIERUNG & ERZWUNGENE 100er SCHRITTE
    // ==========================================================================
    const vinylForm = document.getElementById("vinylContactForm");
    const vSubmitBtn = document.getElementById("vSubmitBtn");
    const vStueckzahl = document.getElementById("vStueckzahl");

    if (vStueckzahl) {
        vStueckzahl.addEventListener("change", function () {
            let value = parseInt(this.value, 10);
            if (isNaN(value) || value < 100) {
                this.value = 100;
            } else {
                this.value = Math.round(value / 100) * 100;
            }
        });
    }

    if (vinylForm) {
        vinylForm.addEventListener("submit", function (event) {
            
            const hatProdukt = [
                "Produkt_Kastentasche_12", "Produkt_Kastentasche_10", "Produkt_Kastentasche_7",
                "Produkt_Gatefold_12", "Produkt_Innentasche_12", "Produkt_Innentasche_10", "Produkt_Innentasche_7"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatRuecken = [
                "Ruecken_Ohne", "Ruecken_3mm", "Ruecken_6mm", "Ruecken_7mm", "Ruecken_10mm"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatKarton = [
                "Karton_Chromokarton", "Karton_Kraftkarton", "Karton_Graukarton", "Karton_Sulfatkarton"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatFarbigkeit = [
                "Farbe_4c", "Farbe_1c", "Farbe_Sonder"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            const hatGrammatur = [
                "Gramm_180", "Gramm_GZ1_190", "Gramm_GC1_200", "Gramm_300", "Gramm_GC1_300",
                "Gramm_350", "Gramm_GC1_350", "Gramm_Andere"
            ].some(name => {
                const el = vinylForm.querySelector(`[name="${name}"]`);
                return el ? el.checked : false;
            });

            if (!hatProdukt || !hatRuecken || !hatKarton || !hatFarbigkeit || !hatGrammatur) {
                event.preventDefault();
                let fehler = "Bitte füllen Sie folgende Pflichtbereiche aus:\n";
                if (!hatProdukt) fehler += "• Mindestens einen Produkt-Typ auswählen\n";
                if (!hatRuecken) fehler += "• Mindestens eine Rückenbreite auswählen\n";
                if (!hatKarton) fehler += "• Mindestens eine Kartonsorte auswählen\n";
                if (!hatFarbigkeit) fehler += "• Mindestens eine Farbigkeit auswählen\n";
                if (!hatGrammatur) fehler += "• Mindestens eine Grammatur auswählen\n";
                alert(fehler);
                return;
            }

            event.preventDefault();

            if (vSubmitBtn) {
                vSubmitBtn.disabled = true;
                vSubmitBtn.textContent = "Wird gesendet...";
            }

            const formData = new FormData(this);
            const fileInput = document.getElementById("vFile");

            const rueckenbreiten = [];
            if (formData.get("Ruecken_Ohne")) rueckenbreiten.push("Ohne Rücken");
            if (formData.get("Ruecken_3mm")) rueckenbreiten.push("3 mm");
            if (formData.get("Ruecken_6mm")) rueckenbreiten.push("6 mm");
            if (formData.get("Ruecken_7mm")) rueckenbreiten.push("7 mm");
            if (formData.get("Ruecken_10mm")) rueckenbreiten.push("10 mm");

            const kartonsorten = [];
            if (formData.get("Karton_Chromokarton")) kartonsorten.push("Chromokarton (GC1)");
            if (formData.get("Karton_Kraftkarton")) kartonsorten.push("Kraftkarton");
            if (formData.get("Karton_Graukarton")) kartonsorten.push("Graukarton");
            if (formData.get("Karton_Sulfatkarton")) kartonsorten.push("Sulfatkarton (GZ1)");

            const farbAuswahl = [];
            if (formData.get("Farbe_4c")) farbAuswahl.push("4/4-farbig (CMYK)");
            if (formData.get("Farbe_1c")) farbAuswahl.push("1/1-farbig (Schwarz/Weiß)");
            if (formData.get("Farbe_Sonder")) farbAuswahl.push("Sonderfarbe");

            const grammAuswahl = [];
            if (formData.get("Gramm_180")) grammAuswahl.push("180 g/m²");
            if (formData.get("Gramm_GZ1_190")) grammAuswahl.push("190 g/m²");
            if (formData.get("Gramm_GC1_200")) grammAuswahl.push("200 g/m²");
            if (formData.get("Gramm_300")) grammAuswahl.push("300 g/m²");
            if (formData.get("Gramm_GC1_300")) grammAuswahl.push("300 g/m² (GC1)");
            if (formData.get("Gramm_350")) grammAuswahl.push("350 g/m²");
            if (formData.get("Gramm_GC1_350")) grammAuswahl.push("350 g/m² (GC1)");
            const freitextGrammatur = formData.get("grammaturDetails") || "";
            if (formData.get("Gramm_Andere")) {
                grammAuswahl.push(freitextGrammatur.trim() !== "" ? freitextGrammatur : "Andere Grammatur");
            }

            const veredelungen = [];
            if (formData.get("Veredelung_Heissfolie")) veredelungen.push("Heißfolienprägung");
            if (formData.get("Veredelung_Lack")) veredelungen.push("Partielle Lackierung");
            if (formData.get("Veredelung_Blindpraegung")) veredelungen.push("Blindprägung");
            if (formData.get("Veredelung_Stanzung")) veredelungen.push("Stanzung");

            const dispersionCello = [];
            if (formData.get("Disp_Glanz")) dispersionCello.push("Dispersionslack glanz");
            if (formData.get("Disp_Matt")) dispersionCello.push("Dispersionslack matt");
            if (formData.get("Cello_Glanz")) dispersionCello.push("Cellophanierung glanz");
            if (formData.get("Cello_Matt")) dispersionCello.push("Cellophanierung matt (kratzfest)");

            const extrasList = [];
            if (formData.get("Extra_Innendruck")) extrasList.push("Innendruck der Tasche");
            if (formData.get("Extra_Optimierte_Mittelloecher")) extrasList.push("Optimierte Mittellöcher");
            if (formData.get("Extra_Zentrierte_Mittelloecher")) extrasList.push("Zentrierte Mittellöcher");
            if (formData.get("Extra_Schallplatten_Labels")) extrasList.push("Labels");
            if (formData.get("Extra_Einleger_Booklets")) extrasList.push("Einleger & Booklets");

            const dataObject = {
                formType: "vinyl",
                firmaBand: formData.get("firmaBand") || "",
                projektname: formData.get("projektname") || "",
                name: formData.get("name") || "",
                email: formData.get("email") || "",
                phone: formData.get("phone") || "",
                
                Produkt_Kastentasche_12: formData.get("Produkt_Kastentasche_12") ? true : false,
                Produkt_Kastentasche_10: formData.get("Produkt_Kastentasche_10") ? true : false,
                Produkt_Kastentasche_7: formData.get("Produkt_Kastentasche_7") ? true : false,
                Produkt_Gatefold_12: formData.get("Produkt_Gatefold_12") ? true : false,
                Produkt_Innentasche_12: formData.get("Produkt_Innentasche_12") ? true : false,
                Produkt_Innentasche_10: formData.get("Produkt_Innentasche_10") ? true : false,
                Produkt_Innentasche_7: formData.get("Produkt_Innentasche_7") ? true : false,
                
                rueckenbreite: rueckenbreiten.join(", "),
                veredelung: veredelungen.join(", "),
                kartonsorte: kartonsorten.join(", "),
                
                farbigkeit: farbAuswahl.join(", ") || "Keine Auswahl",
                sonderfarbeDetails: formData.get("sonderfarbeDetails") || "",
                grammatur: grammAuswahl.join(", ") || "Keine Auswahl",
                dispersionCello: dispersionCello.join(", ") || "Keine Auswahl",
                
                insideOut: formData.get("Verarbeitung_Inside_Out") ? true : false,
                extras: extrasList.join(", "),
                
                stueckzahl: formData.get("stueckzahl") || "",
                datenlink: formData.get("datenlink") || "", 
                message: formData.get("message") || ""
            };

            function sendData(payload) {
                fetch(vinylForm.action, {
                    method: "POST",
                    redirect: "follow",
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erfolg === true) { 
                        if (typeof bootstrap !== 'undefined') {
                            const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
                            thankYouModal.show();
                        } else {
                            alert("Danke! Ihre Anfrage wurde erfolgreich übermittelt.");
                        }
                        vinylForm.reset();
                    } else {
                        alert("CRM-Fehler: " + data.meldung);
                    }
                })
                .catch(error => {
                    if (typeof bootstrap !== 'undefined') {
                        const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
                        thankYouModal.show();
                    } else {
                        alert("Danke! Ihre Anfrage wurde erfolgreich übermittelt.");
                    }
                    vinylForm.reset();
                })
                .finally(() => {
                    if (vSubmitBtn) {
                        vSubmitBtn.disabled = false;
                        vSubmitBtn.textContent = "Spezifikations-Anfrage absenden";
                    }
                });
            }

            if (fileInput && fileInput.files.length > 0) {
                const selectedFile = fileInput.files[0];
                if (selectedFile.size > 10 * 1024 * 1024) {
                    alert("Datei zu groß! Maximal 10 MB erlaubt.");
                    if (vSubmitBtn) {
                        vSubmitBtn.disabled = false;
                        vSubmitBtn.textContent = "Spezifikations-Anfrage absenden";
                    }
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = function () {
                    dataObject.fileData = reader.result; 
                    dataObject.fileName = selectedFile.name; 
                    sendData(dataObject);
                };
            } else {
                sendData(dataObject);
            }
        });
    }

    // ==========================================================================
    // 11. DYNAMISCHE MATRIX & PRODUKTIONS-VALIDIERUNG (Lochungskonflikte gelöst)
    // ==========================================================================
    const gatefoldCheckbox = document.querySelector('[name="Produkt_Gatefold_12"]');
    const allmRückenOptionen = document.querySelectorAll('.allgemein-option');
    const grammDivs = document.querySelectorAll('.gramm-option');

    const kartonChromo = document.querySelector('[name="Karton_Chromokarton"]');
    const kartonKraft = document.querySelector('[name="Karton_Kraftkarton"]');
    const kartonGrau = document.querySelector('[name="Karton_Graukarton"]');
    const kartonSulfat = document.querySelector('[name="Karton_Sulfatkarton"]');

    const prodK12 = document.querySelector('[name="Produkt_Kastentasche_12"]');
    const prodK10 = document.querySelector('[name="Produkt_Kastentasche_10"]');
    const prodK7 = document.querySelector('[name="Produkt_Kastentasche_7"]');
    
    const prodI12 = document.querySelector('[name="Produkt_Innentasche_12"]');
    const prodI10 = document.querySelector('[name="Produkt_Innentasche_10"]');
    const prodI7 = document.querySelector('[name="Produkt_Innentasche_7"]');

    const optLochOpt = document.querySelector('[name="Extra_Optimierte_Mittelloecher"]');
    const optLochZentr = document.querySelector('[name="Extra_Zentrierte_Mittelloecher"]');

    function updateSpezifikationsMatrix() {
        const gatefoldChecked = gatefoldCheckbox ? gatefoldCheckbox.checked : false;
        const chromoChecked = kartonChromo ? kartonChromo.checked : false;
        const kraftChecked = kartonKraft ? kartonKraft.checked : false;
        const grauChecked = kartonGrau ? kartonGrau.checked : false;
        const sulfatChecked = kartonSulfat ? kartonSulfat.checked : false;
        const irgendeinKartonAktiv = chromoChecked || kraftChecked || grauChecked || sulfatChecked;

        // A. Rückenbreiten sperren bei Gatefold
        allmRückenOptionen.forEach(div => {
            const input = div.querySelector('input');
            if (input) {
                if (gatefoldChecked) {
                    input.checked = false;
                    input.disabled = true;
                    div.style.opacity = '0.35';
                } else {
                    input.disabled = false;
                    div.style.opacity = '1';
                }
            }
        });

        // B. Grammaturen filtern nach Kartonsorte
        grammDivs.forEach(div => {
            const input = div.querySelector('input');
            if (!input) return;

            const name = input.name;
            let erlaubtDurchKarton = true;
            let erlaubtDurchGatefold = true;

            if (gatefoldChecked && div.classList.contains('gramm-allgemein')) {
                erlaubtDurchGatefold = false;
            }

            if (irgendeinKartonAktiv) {
                erlaubtDurchKarton = false;
                if (chromoChecked && (name === 'Gramm_200' || name === 'Gramm_300' || name === 'Gramm_350' || name === 'Gramm_GC1_200' || name === 'Gramm_GC1_300' || name === 'Gramm_GC1_350')) {
                    erlaubtDurchKarton = true;
                }
                if (kraftChecked && (name === 'Gramm_300' || name === 'Gramm_350')) {
                    erlaubtDurchKarton = true;
                }
                if (grauChecked && (name === 'Gramm_350')) {
                    erlaubtDurchKarton = true;
                }
                if (sulfatChecked && (name === 'Gramm_GZ1_190')) {
                    erlaubtDurchKarton = true;
                }
                if (name === 'Gramm_Andere') {
                    erlaubtDurchKarton = true;
                }
            }

            if (erlaubtDurchKarton && erlaubtDurchGatefold) {
                input.disabled = false;
                div.style.opacity = '1';
            } else {
                input.checked = false;
                input.disabled = true;
                div.style.opacity = '0.35';
            }
        });

        // C. PRODUKTIONS-ABGLEICH FÜR LOCHUNGEN
        const kastentascheAktiv = (prodK12 && prodK12.checked) || (prodK10 && prodK10.checked) || (prodK7 && prodK7.checked);
        const andereTascheAktiv = gatefoldChecked || (prodI12 && prodI12.checked) || (prodI10 && prodI10.checked) || (prodI7 && prodI7.checked);

        const modalEl = document.getElementById('maxiHoleModal');
        const msgEl = document.getElementById('modalHoleMessage');

        // Kastentasche darf NIEMALS zentriert sein
        if (kastentascheAktiv && optLochZentr && optLochZentr.checked) {
            optLochZentr.checked = false; 
            if (optLochOpt) optLochOpt.checked = true;
            
            if (modalEl && typeof bootstrap !== 'undefined') {
                if (msgEl) msgEl.textContent = "Diese Mittelloch-Kombination ist keine Standard-Kombination.Kastentaschen erfordern zwingend optimierte Mittellöcher. Wenn Sie diese Kombination wünschen, kontaktieren Sie uns unter vinyl@druckerei-goerner.de.";
                const myModal = new bootstrap.Modal(modalEl);
                myModal.show();
            }
        }

        // Andere Formate (Gatefold / Innentasche) dürfen NIEMALS optimiert sein
        if (andereTascheAktiv && !kastentascheAktiv && optLochOpt && optLochOpt.checked) {
            optLochOpt.checked = false;
            if (optLochZentr) optLochZentr.checked = true;
            
            if (modalEl && typeof bootstrap !== 'undefined') {
                if (msgEl) msgEl.textContent = "Diese Mittelloch-Kombination ist keine Standard-Kombination. Kastentaschen erfordern optimierte Mittellöcher. Wenn Sie diese Kombination wünschen, kontaktieren Sie uns unter vinyl@druckerei-goerner.de.";
                const myModal = new bootstrap.Modal(modalEl);
                myModal.show();
            }
        }
    }

    if (gatefoldCheckbox) gatefoldCheckbox.addEventListener('change', updateSpezifikationsMatrix);
    if (optLochOpt) optLochOpt.addEventListener('change', updateSpezifikationsMatrix);
    if (optLochZentr) optLochZentr.addEventListener('change', updateSpezifikationsMatrix);

    [kartonChromo, kartonKraft, kartonGrau, kartonSulfat, prodK12, prodK10, prodK7, prodI12, prodI10, prodI7].forEach(chk => {
        if (chk) chk.addEventListener('change', updateSpezifikationsMatrix);
    });

    updateSpezifikationsMatrix();
});