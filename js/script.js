document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. INTRO ANIMATION & CHRONIK-STACK ROTATOR
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
                    setTimeout(() => { cyl.classList.add('ignited'); }, 300 + (index * 250));
                });
            }
        }
        
        if (workstationWrapper) { workstationWrapper.classList.add("loaded"); }
        if (packagingStage) { packagingStage.classList.add("loaded"); }
        if (heroText) { heroText.classList.add("visible"); }
        
        const photoStack = document.getElementById("historicalPhotoStack");
        const btnNext = document.getElementById("btnNextPhoto");
        
        if (photoStack) {
            let isRotating = false;

            function rotateChronikStack() {
                if (isRotating) return;
                
                const cards = Array.from(photoStack.querySelectorAll(".historical-photo-card"));
                if (cards.length === 0) return;

                const topCard = cards.find(card => card.classList.contains("pos-1"));
                if (!topCard) return;

                isRotating = true;
                topCard.classList.add("swipe-out");

                setTimeout(() => {
                    cards.forEach(card => {
                        if (card.classList.contains("pos-1")) {
                            card.classList.remove("pos-1");
                            card.classList.add("pos-6");
                        } else if (card.classList.contains("pos-2")) {
                            card.classList.remove("pos-2");
                            card.classList.add("pos-1");
                        } else if (card.classList.contains("pos-3")) {
                            card.classList.remove("pos-3");
                            card.classList.add("pos-2");
                        } else if (card.classList.contains("pos-4")) {
                            card.classList.remove("pos-4");
                            card.classList.add("pos-3");
                        } else if (card.classList.contains("pos-5")) {
                            card.classList.remove("pos-5");
                            card.classList.add("pos-4");
                        } else if (card.classList.contains("pos-6")) {
                            card.classList.remove("pos-6");
                            card.classList.add("pos-5");
                        }
                    });

                    topCard.classList.remove("swipe-out");
                    isRotating = false;
                }, 650);
            }

            photoStack.addEventListener("click", function(e) {
                e.preventDefault();
                rotateChronikStack();
            });

            if (btnNext) {
                btnNext.addEventListener("click", function (e) {
                    e.preventDefault();
                    rotateChronikStack();
                });
            }
        }
    }, 300);

    // ==========================================================================
    // 2. REAKTIVE MITTELLOCH-MATRIX FÜR LABELS & EINLEGER
    // ==========================================================================
    const extraLabels = document.getElementById("Extra_Schallplatten_Labels");
    const extraEinleger = document.getElementById("Extra_Einleger_Booklets");
    const mittellochOptionenBlock = document.getElementById("mittelloch_optionen_block");
    const optLochZentr = document.getElementById("optLochZentr");
    const optLochOpt = document.getElementById("optLochOpt");

    function checkHoleMatrix() {
        const labelsAktiv = extraLabels ? extraLabels.checked : false;
        const einlegerAktiv = extraEinleger ? extraEinleger.checked : false;

        if (labelsAktiv || einlegerAktiv) {
            if (optLochZentr) optLochZentr.checked = false;
            if (optLochOpt) optLochOpt.checked = false;
            if (mittellochOptionenBlock) mittellochOptionenBlock.classList.add("d-none");
        } else {
            if (mittellochOptionenBlock) mittellochOptionenBlock.classList.remove("d-none");
        }
    }

    if (extraLabels) extraLabels.addEventListener("change", checkHoleMatrix);
    if (extraEinleger) extraEinleger.addEventListener("change", checkHoleMatrix);
    if (optLochZentr) optLochZentr.addEventListener("change", checkHoleMatrix);
    if (optLochOpt) optLochOpt.addEventListener("change", checkHoleMatrix);

    // ==========================================================================
    // 3. VINYL-KONFIGURATOR: INITIALISIERUNG
    // ==========================================================================
    const pTypeSelect = document.getElementById("configProductType");
    const kartonSelect = document.getElementById("configKarton");
    const lochSelect = document.getElementById("configLoch");

    if (pTypeSelect) pTypeSelect.addEventListener("change", handleProductTypeChange);
    if (kartonSelect) kartonSelect.addEventListener("change", updateGrammaturOptions);
    if (lochSelect) lochSelect.addEventListener("change", handleHoleSelectionChange);

    setDefaultLackCello();
    handleProductTypeChange();

    // ==========================================================================
    // 4. AJAX FORMULAR-VERSAND AN DAS CRM BACKEND
    // ==========================================================================
    const vinylForm = document.getElementById("vinylContactForm");
    const vSubmitBtn = document.getElementById("vSubmitBtn");

    if (vinylForm) {
        vinylForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (basketItems.length === 0) {
                alert("Bitte fügen Sie mindestens eine Komponente zu Ihrer Anfrage hinzu.");
                return;
            }

            if (vSubmitBtn) {
                vSubmitBtn.disabled = true;
                vSubmitBtn.textContent = "Wird gesendet...";
            }

            const formData = new FormData(this);
            const fileInput = document.getElementById("vFile");

            let crmZeilenArray = basketItems.map((item, idx) => {
                let zeile = `${idx + 1}. ${item.pType} [Menge: ${item.amount} Stk.]\n`;
                if (item.karton !== '-') zeile += `   • Material: ${item.karton} (${item.grammatur})\n`;
                if (item.farbe !== '-') zeile += `   • Farbigkeit: ${item.farbe}\n`;
                if (item.innendruck !== '-') zeile += `   • Innendruck: ${item.innendruck}\n`;
                if (item.verarbeitung !== '-') zeile += `   • Veredelung: ${item.verarbeitung}\n`;
                if (item.lackCello !== '-') zeile += `   • Lack/Cello: ${item.lackCello}\n`;
                if (item.loch !== '-') zeile += `   • Mittellöcher: ${item.loch}\n`;
                if (item.hinweis) zeile += `   • HINWEIS: ${item.hinweis}\n`;
                return zeile;
            });

            const gesamtStueckzahl = basketItems.reduce((acc, curr) => acc + parseInt(curr.amount, 10), 0).toString();
            
            let kundenNachricht = formData.get("message") || "";
            const abweichungen = basketItems.filter(i => i.hinweis).map(i => `${i.pType}: ${i.hinweis}`);
            if (abweichungen.length > 0) {
                kundenNachricht += (kundenNachricht ? "\n\n" : "") + "[System-Hinweise Abweichungen]:\n" + abweichungen.join("\n");
            }

            const dataObject = {
                formType: "vinyl",
                firmaBand: formData.get("firmaBand") || "",
                projektname: formData.get("projektname") || "",
                name: formData.get("name") || "",
                email: formData.get("email") || "",
                phone: formData.get("phone") || "",
                stueckzahl: gesamtStueckzahl,
                projektZusammenfassung: crmZeilenArray.join("\n"),
                datenlink: formData.get("datenlink") || "", 
                message: kundenNachricht
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
                            const thankYouModalEl = document.getElementById('thankYouModal');
                            const thankYouModal = new bootstrap.Modal(thankYouModalEl);
                            thankYouModal.show();
                        } else {
                            alert("Danke! Ihre Spezifikations-Anfrage wurde erfolgreich übermittelt.");
                        }
                        
                        vinylForm.reset();
                        clearFileInput();
                        basketItems = [];
                        renderBasket();
                        resetFormFields();
                        checkHoleMatrix();
                    } else {
                        alert("CRM-Fehler: " + data.meldung);
                    }
                })
                .catch(err => {
                    alert("Verbindungsfehler zum CRM. Anfrage konnte nicht übermittelt werden.");
                })
                .finally(() => {
                    if (vSubmitBtn) {
                        vSubmitBtn.disabled = false;
                        vSubmitBtn.textContent = "Gesamtanfrage absenden";
                    }
                });
            }

            if (fileInput && fileInput.files.length > 0) {
                const selectedFile = fileInput.files[0];
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
});

// ==========================================================================
// GLOBALE LOGIK-FUNKTIONEN FÜR DEN VINYL-KONFIGURATOR
// ==========================================================================
let basketItems = [];

function toggleFileClearBtn() {
    const fileInput = document.getElementById("vFile");
    const clearBtn = document.getElementById("vFileClearBtn");
    if (fileInput && clearBtn) {
        if (fileInput.files.length > 0) {
            clearBtn.classList.remove("d-none");
        } else {
            clearBtn.classList.add("d-none");
        }
    }
}

function clearFileInput() {
    const fileInput = document.getElementById("vFile");
    const clearBtn = document.getElementById("vFileClearBtn");
    if (fileInput) fileInput.value = "";
    if (clearBtn) clearBtn.classList.add("d-none");
}

function setDefaultLackCello() {
    const lackCelloSelect = document.getElementById("configLackCello");
    if (lackCelloSelect) {
        lackCelloSelect.value = "Dispersionslack glanz";
    }
}

function handleProductTypeChange() {
    const pTypeEl = document.getElementById("configProductType");
    if (!pTypeEl) return;
    const pType = pTypeEl.value;
    
    const kartonWrapper = document.getElementById("configKarton")?.closest('.form-grid-inner') || document.getElementById("configKarton")?.parentElement;
    const farbeGroup = document.getElementById("farbeKachelnGroup")?.parentElement;
    const innendruckGroup = document.getElementById("innendruckKachelnGroup")?.parentElement;
    const verarbeitungGroup = document.getElementById("verarbeitungKachelnGroup")?.parentElement;
    const lackWrapper = document.getElementById("configLackCello")?.parentElement;
    const lochWrapper = document.getElementById("configLoch")?.parentElement;

    if (kartonWrapper) kartonWrapper.classList.remove("d-none");
    if (farbeGroup) farbeGroup.classList.remove("d-none");
    if (innendruckGroup) innendruckGroup.classList.remove("d-none");
    if (verarbeitungGroup) verarbeitungGroup.classList.remove("d-none");
    if (lackWrapper) lackWrapper.classList.remove("d-none");
    if (lochWrapper) lochWrapper.classList.remove("d-none");

    if (pType === "Schallplatten-Labels") {
        if (kartonWrapper) kartonWrapper.classList.add("d-none");
        if (innendruckGroup) innendruckGroup.classList.add("d-none");
        if (verarbeitungGroup) verarbeitungGroup.classList.add("d-none");
        if (lackWrapper) lackWrapper.classList.add("d-none");
        if (lochWrapper) lochWrapper.classList.add("d-none");
    } else if (pType === "Einleger / Booklets") {
        if (innendruckGroup) innendruckGroup.classList.add("d-none");
        if (lackWrapper) lackWrapper.classList.add("d-none");
    }

    updateGrammaturOptions();
    resetHoleWarningState();
}

function updateGrammaturOptions() {
    const pTypeEl = document.getElementById("configProductType");
    const kartonEl = document.getElementById("configKarton");
    const grammSelect = document.getElementById("configGrammatur");
    
    if (!grammSelect || !pTypeEl || !kartonEl) return;
    
    const pType = pTypeEl.value;
    const karton = kartonEl.value;
    grammSelect.innerHTML = "";
    
    let optionen = [];
    
    if (pType === "12\" Gatefold") {
        if (karton === "Chromokarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Kraftkarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Graukarton") {
            optionen = ["350 g/m²"];
        }
    } else {
        if (karton === "Chromokarton") {
            optionen = ["200 g/m²", "300 g/m²", "350 g/m²"];
        } else if (karton === "Kraftkarton") {
            optionen = ["300 g/m²", "350 g/m²"];
        } else if (karton === "Graukarton") {
            optionen = ["350 g/m²"];
        } else if (karton === "Sulfatkarton") {
            optionen = ["190 g/m²"];
        }
    }
    
    if (optionen.length === 0) {
        optionen = ["Keine Auswahl verfügbar"];
    }
    
    optionen.forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        grammSelect.appendChild(opt);
    });
}

function toggleSonderfarbeField() {
    const chkSonder = document.getElementById("chk_farbe_sonder");
    const sonderfarbeWrapper = document.getElementById("sonderfarbeWrapper");
    if (!chkSonder || !sonderfarbeWrapper) return;

    if (chkSonder.checked) {
        sonderfarbeWrapper.classList.remove("d-none");
    } else {
        sonderfarbeWrapper.classList.add("d-none");
        const detailsInput = document.getElementById("configSonderfarbeDetails");
        if (detailsInput) detailsInput.value = "";
    }
}

function handleKeinInnendruckToggle() {
    const chkKein = document.getElementById("chk_innendruck_kein");
    if (chkKein && chkKein.checked) {
        document.getElementById("chk_innendruck_4c").checked = false;
        document.getElementById("chk_innendruck_1c").checked = false;
        document.getElementById("chk_innendruck_sonder").checked = false;
        toggleInnendruckSonderfarbeField();
    }
}

function toggleInnendruckSonderfarbeField() {
    const chkSonder = document.getElementById("chk_innendruck_sonder");
    const wrapper = document.getElementById("innendruckSonderfarbeWrapper");
    if (!chkSonder || !wrapper) return;

    if (chkSonder.checked) {
        document.getElementById("chk_innendruck_kein").checked = false;
        wrapper.classList.remove("d-none");
    } else {
        wrapper.classList.add("d-none");
        const detailsInput = document.getElementById("configInnendruckSonderfarbeDetails");
        if (detailsInput) detailsInput.value = "";
    }
}

function validateStep100(input) {
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 100) val = 100;
    val = Math.round(val / 100) * 100;
    input.value = val;
}

function handleHoleSelectionChange() {
    const holeSelect = document.getElementById("configLoch");
    const warningContainer = document.getElementById("holeWarningContainer");
    const warningText = document.getElementById("holeWarningText");
    const confirmationCheckbox = document.getElementById("configLochBestaetigung");

    if (!holeSelect || !warningContainer || !warningText) return;

    const val = holeSelect.value;
    if (val === "Zentriert") {
        warningText.textContent = `Hinweis: Die Auswahl "Zentriert" weicht vom Standard ("Automatisch optimiert") ab. Bitte bestätigen Sie die Abweichung.`;
        warningContainer.classList.remove("d-none");
    } else {
        warningContainer.classList.add("d-none");
        if (confirmationCheckbox) confirmationCheckbox.checked = false;
    }
}

function resetHoleWarningState() {
    const warningContainer = document.getElementById("holeWarningContainer");
    const confirmationCheckbox = document.getElementById("configLochBestaetigung");
    const holeSelect = document.getElementById("configLoch");
    if (holeSelect) holeSelect.value = "Automatisch optimiert";
    if (warningContainer) warningContainer.classList.add("d-none");
    if (confirmationCheckbox) confirmationCheckbox.checked = false;
}

function getSelectedFarbeValues() {
    const selected = [];
    if (document.getElementById("chk_farbe_4c")?.checked) selected.push("4/4-farbig");
    if (document.getElementById("chk_farbe_1c")?.checked) selected.push("1/1-farbig");
    
    if (document.getElementById("chk_farbe_sonder")?.checked) {
        const details = document.getElementById("configSonderfarbeDetails")?.value.trim();
        selected.push(details ? `Sonderfarbe (${details})` : "Sonderfarbe");
    }
    return selected.length > 0 ? selected.join(" + ") : "Keine Auswahl";
}

function getSelectedInnendruckValues() {
    if (document.getElementById("chk_innendruck_kein")?.checked) return "Kein Innendruck";

    const selected = [];
    if (document.getElementById("chk_innendruck_4c")?.checked) selected.push("4/4-farbig");
    if (document.getElementById("chk_innendruck_1c")?.checked) selected.push("1/1-farbig");
    
    if (document.getElementById("chk_innendruck_sonder")?.checked) {
        const details = document.getElementById("configInnendruckSonderfarbeDetails")?.value.trim();
        selected.push(details ? `Sonderfarbe (${details})` : "Sonderfarbe");
    }
    return selected.length > 0 ? selected.join(" + ") : "Kein Innendruck";
}

function getSelectedVerarbeitungValues() {
    const selected = [];
    if (document.getElementById("chk_verarb_heissfolie")?.checked) selected.push("Heißfolienprägung");
    if (document.getElementById("chk_verarb_lack")?.checked) selected.push("Partielle Lackierung");
    if (document.getElementById("chk_verarb_blind")?.checked) selected.push("Blindprägung");
    if (document.getElementById("chk_verarb_stanzung")?.checked) selected.push("Stanzung");
    if (document.getElementById("chk_verarb_insideout")?.checked) selected.push("Inside Out");
    return selected.length > 0 ? selected.join(" + ") : "Keine";
}

function addProductToBasket() {
    const holeSelect = document.getElementById("configLoch");
    const confirmationCheckbox = document.getElementById("configLochBestaetigung");

    let abweichungBestaetigt = false;
    if (holeSelect && holeSelect.value === "Zentriert") {
        if (confirmationCheckbox && !confirmationCheckbox.checked) {
            alert("Bitte bestätigen Sie die Abweichung bei den Mittellöchern, bevor Sie das Produkt hinzufügen.");
            return;
        }
        if (confirmationCheckbox && confirmationCheckbox.checked) {
            abweichungBestaetigt = true;
        }
    }

    const pType = document.getElementById("configProductType") ? document.getElementById("configProductType").value : "";

    let item = {
        id: Date.now(),
        pType: pType,
        amount: document.getElementById("configAmount") ? document.getElementById("configAmount").value : "100",
        farbe: getSelectedFarbeValues(),
        hinweis: abweichungBestaetigt ? "Abweichung Mittellöcher Zentriert ausdrücklich gewünscht" : ""
    };

    if (pType === "Schallplatten-Labels") {
        item.karton = "-";
        item.grammatur = "-";
        item.innendruck = "-";
        item.verarbeitung = "-";
        item.lackCello = "-";
        item.loch = "-";
    } else if (pType === "Einleger / Booklets") {
        item.karton = document.getElementById("configKarton") ? document.getElementById("configKarton").value : "";
        item.grammatur = document.getElementById("configGrammatur") ? document.getElementById("configGrammatur").value : "";
        item.innendruck = "-";
        item.verarbeitung = getSelectedVerarbeitungValues();
        item.lackCello = "-";
        item.loch = holeSelect ? holeSelect.value : "Automatisch optimiert";
    } else {
        item.karton = document.getElementById("configKarton") ? document.getElementById("configKarton").value : "";
        item.grammatur = document.getElementById("configGrammatur") ? document.getElementById("configGrammatur").value : "";
        item.innendruck = getSelectedInnendruckValues();
        item.verarbeitung = getSelectedVerarbeitungValues();
        item.lackCello = document.getElementById("configLackCello") ? document.getElementById("configLackCello").value : "";
        item.loch = holeSelect ? holeSelect.value : "Automatisch optimiert";
    }

    basketItems.push(item);
    renderBasket();
    resetFormFields();
}

/* ==========================================================================
   INTERAKTIVE KACHEL-MUTEX-LOGIK (FARBIGKEIT & INNENDRUCK)
   ========================================================================== */

// --- FARBIGKEIT (1c vs. 4c exklusiv, Sonderfarbe frei) ---
function handleFarbigkeitToggle(selectedId) {
    const chk4c = document.getElementById("chk_farbe_4c");
    const chk1c = document.getElementById("chk_farbe_1c");

    if (selectedId === "chk_farbe_4c" && chk4c && chk4c.checked) {
        if (chk1c) chk1c.checked = false;
    } else if (selectedId === "chk_farbe_1c" && chk1c && chk1c.checked) {
        if (chk4c) chk4c.checked = false;
    }
}

// --- INNENDRUCK (Kein vs. 4c vs. 1c exklusiv, Sonderfarbe frei) ---
function handleInnendruckToggle(selectedId) {
    const chkKein = document.getElementById("chk_innendruck_kein");
    const chk4c = document.getElementById("chk_innendruck_4c");
    const chk1c = document.getElementById("chk_innendruck_1c");

    if (selectedId === "chk_innendruck_kein" && chkKein && chkKein.checked) {
        if (chk4c) chk4c.checked = false;
        if (chk1c) chk1c.checked = false;
    } else if (selectedId === "chk_innendruck_4c" && chk4c && chk4c.checked) {
        if (chkKein) chkKein.checked = false;
        if (chk1c) chk1c.checked = false;
    } else if (selectedId === "chk_innendruck_1c" && chk1c && chk1c.checked) {
        if (chkKein) chkKein.checked = false;
        if (chk4c) chk4c.checked = false;
    }
}

function resetFormFields() {
    document.querySelectorAll("#farbeKachelnGroup input[type='checkbox'], #verarbeitungKachelnGroup input[type='checkbox'], #innendruckKachelnGroup input[type='checkbox']").forEach(cb => cb.checked = false);
    
    const chk4c = document.getElementById("chk_farbe_4c");
    const chkKeinInnen = document.getElementById("chk_innendruck_kein");
    if (chk4c) chk4c.checked = true;
    if (chkKeinInnen) chkKeinInnen.checked = true;

    toggleSonderfarbeField();
    toggleInnendruckSonderfarbeField();
    resetHoleWarningState();
    setDefaultLackCello();
}

function renderBasket() {
    const basketList = document.getElementById("basketList");
    const emptyMsg = document.getElementById("basketEmptyMessage");
    if (!basketList) return;

    basketList.innerHTML = "";

    if (basketItems.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove("d-none");
        basketList.appendChild(emptyMsg);
        return;
    }

    if (emptyMsg) emptyMsg.classList.add("d-none");

    basketItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "list-group-item d-flex justify-content-between align-items-center mb-2";
        div.innerHTML = `
            <div>
                <strong class="text-magenta">${item.pType}</strong> (${item.amount} Stk.)<br>
                <small class="text-muted">
                    ${item.karton !== '-' ? item.karton + ' ' + item.grammatur + ' | ' : ''}
                    Farbe: ${item.farbe}
                    ${item.innendruck !== '-' ? ' | Innendruck: ' + item.innendruck : ''}
                    ${item.verarbeitung !== '-' ? ' | Verarb.: ' + item.verarbeitung : ''}
                    ${item.lackCello !== '-' ? ' | Lack/Cello: ' + item.lackCello : ''}
                    ${item.loch !== '-' ? ' | Löcher: ' + item.loch : ''}
                    ${item.hinweis ? '<br><span class="text-warning">⚠ ' + item.hinweis + '</span>' : ''}
                </small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeBasketItem(${item.id})">✕</button>
        `;
        basketList.appendChild(div);
    });
}

function removeBasketItem(id) {
    basketItems = basketItems.filter(item => item.id !== id);
    renderBasket();
}

function saveCookieConsent(acceptedType) {
    const consentData = {
        formType: "cookie_consent",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        consentType: acceptedType
    };

    localStorage.setItem("goerner_cookie_consent", acceptedType);

    fetch("https://script.google.com/macros/s/AKfycbwNYzte8SJqxizVJyS-cwS9UWl9RHOnP2QUg8MLd_FEmKsarvnzpgXWH3GE4FV57MJE/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consentData)
    });
}