const lineData = {
    1: [
        { name: "60g(Linia 1)", pcsInBox: 20, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 30, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 40, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 42, weightPerPc: 0.054, doughMixWeight:429},
        { name: "110g(Linia 1)", pcsInBox: 20, weightPerPc: 0.094, doughMixWeight:356},
    ],
    2: [
        { name: "60g(Linia 2)", pcsInBox: 40, weightPerPc: 0.032, doughMixWeight:349},
        { name: "60g Kokos(Linia 2)", pcsInBox: 40, weightPerPc: 0.032, doughMixWeight:352},
        { name: "37g(Linia 2)", pcsInBox: 50, weightPerPc: 0.032, doughMixWeight:310},
        { name: "37g(Linia 2)", pcsInBox: 60, weightPerPc: 0.032, doughMixWeight:310},
        { name: "37g M.J(Linia 2)", pcsInBox: 60, weightPerPc: 0.032, doughMixWeight:315},
    ],
    3: [
        { name: "60g(Linia 3)", pcsInBox: 18, weightPerPc: 0.054, doughMixWeight:371},
        { name: "60g(Linia 3)", pcsInBox: 20, weightPerPc: 0.054, doughMixWeight:371},
        { name: "60g(Linia 3)", pcsInBox: 40, weightPerPc: 0.054, doughMixWeight:371},
        { name: "60g Oreo(Linia 3)", pcsInBox: 20, weightPerPc: 0.050, doughMixWeight:343},
        { name: "98g(Linia 3)", pcsInBox: 20, weightPerPc: 0.078, doughMixWeight:445},
        { name: "98g Molto(Linia 3)", pcsInBox: 18, weightPerPc: 0.078, doughMixWeight:435},
        { name: "98g Oreo(Linia 3)", pcsInBox: 20, weightPerPc: 0.075, doughMixWeight:400},
    ],
    4: [
        { name: "MINI(Linia 4)", pcsInBox: 20, weightPerPc: 0.0106, doughMixWeight:405},
    ],
    5: [
        { name: "Produkt D (Linia BR)", pcsInBox: 20, weightPerPc: 0.10, doughWeightFactor: 1.0 }
    ]
};

let activeLine = 1;

// 1. Sprawdzanie akceptacji regulaminu przy starcie strony
document.addEventListener("DOMContentLoaded", function() {
    // Inicjalnie ładujemy listę dla pierwszej linii, żeby formularz nie był pusty
    updateProductDropdown();

    const isAccepted = localStorage.getItem('regulationsAccepted');
    if (isAccepted === 'true') {
        const regulationsSection = document.querySelector('.regulations_section');
        const lineSection = document.querySelector('.line_section');
        
        if (regulationsSection && lineSection) {
            regulationsSection.classList.add('hide');
            lineSection.classList.add('show');
        }
    }
});

// 2. Kliknięcie przycisku "Akceptuję"
function acceptRegulations() {
    const regulationsSection = document.querySelector('.regulations_section');
    const lineSection = document.querySelector('.line_section');
    
    if (regulationsSection && lineSection) {
        regulationsSection.classList.add('hide');
        lineSection.classList.add('show');
        localStorage.setItem('regulationsAccepted', 'true');
    }
}

// 3. Wybór linii produkcyjnej
function selectLine(lineNumber, buttonElement) {
    activeLine = lineNumber;

    // Przełączanie klasy active na przyciskach
    document.querySelectorAll('.buttons_container button').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');

    // Aktualizacja nagłówka tekstowego
    document.getElementById('current_line_title').innerText = `Wybrana: Linia ${lineNumber}`;

    // Odświeżenie listy rozwijanej produktów
    updateProductDropdown();
}

// 4. Generowanie opcji w menu rozwijanym (select)
function updateProductDropdown() {
    const select = document.getElementById('product_select');
    if (!select) return; // Zabezpieczenie przed błędem, jeśli elementu jeszcze nie ma
    
    select.innerHTML = ''; 

    const products = lineData[activeLine];
    
    if (products) {
        products.forEach((product, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${product.name} [${product.pcsInBox} szt/karton]`;
            select.appendChild(option);
        });
    }

    // Reset pól przy zmianie linii
    const boxesInput = document.getElementById('boxes_input');
    if (boxesInput) boxesInput.value = '';
    
    const finalResult = document.getElementById('final_result');
    if (finalResult) finalResult.innerText = '0.00';
}

// 5. Logika obliczeń matematycznych
function calculate() {
    const boxesInput = document.getElementById('boxes_input');
    const select = document.getElementById('product_select');
    const lossSelect = document.getElementById('loss_select');
    const finalResult = document.getElementById('final_result');

    // Jeśli nie ma pola z wynikiem, przerywamy
    if (!boxesInput || !select || !finalResult) return;

    const boxes = parseFloat(boxesInput.value) || 0;
    if (boxes === 0) {
        finalResult.innerText = '0.000';
        return;
    }

    const selectedProductIndex = select.value;
    const product = lineData[activeLine][selectedProductIndex];

 if (product) {
        // Zczytujemy dane (jeśli czegoś brakuje, wstawia 0)
        const pcs = product.pcsInBox || 0;
        const weight = product.weightPerPc || 0;
        
        // ZABEZPIECZENIE: Skrypt szuka wagi dzieży (np. 371) pod obiema nazwami, których używaliśmy!
        const factor = product.doughWeightFactor || product.doughMixWeight; 

        // 1. Kartony * sztuki w kartonie
        const totalPieces = boxes * pcs;
        
        // 2. Wynik * waga pojedynczej sztuki = Waga łączna w kg
        const totalProductWeight = totalPieces * weight;
        
        // 3. Waga łączna kg / Waga jednej dzieży (np. 371 kg) = Ilość ciast
        const totalDoughBase = totalProductWeight / factor;

        // 4. Pobieranie wybranego procentu z listy
        let lossPercent = 3;
        if (lossSelect && lossSelect.value !== "") {
            lossPercent = parseFloat(lossSelect.value) || 0;
        }
        const lossMultiplier = 1 + (lossPercent / 100);

        // 5. Ostateczny wynik z doliczonym naddatkiem
        const requiredDoughWithLoss = totalDoughBase * lossMultiplier;

        // Wyświetlenie wyniku
        if (isNaN(requiredDoughWithLoss) || !factor) {
            finalResult.innerText = "Błąd bazy";
        } else {
            finalResult.innerText = requiredDoughWithLoss.toFixed(3);
        }
    }
}
