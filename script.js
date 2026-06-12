const lineData = {
    1: [
        { name: "60g(Linia 1)", pcsInBox: 20, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 30, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 40, weightPerPc: 0.054, doughMixWeight:429},
        { name: "60g(Linia 1)", pcsInBox: 42, weightPerPc: 0.054, doughMixWeight:429},
        { name: "110g(Linia 1)", pcsInBox: 20, weightPerPc: 0.094, doughMixWeight:356},
    ],
    2: [
        { name: "37g(Linia 2)", pcsInBox: 50, weightPerPc: 0.032, doughMixWeight:310},
        { name: "37g(Linia 2)", pcsInBox: 60, weightPerPc: 0.032, doughMixWeight:310},
    ],
    3: [
        { name: "60g(Linia 3)", pcsInBox: 18, weightPerPc: 0.054, doughMixWeight:371},
        { name: "60g(Linia 3)", pcsInBox: 20, weightPerPc: 0.054, doughMixWeight:371},
        { name: "60g(Linia 3)", pcsInBox: 40, weightPerPc: 0.054, doughMixWeight:371},
    ],
    4: [
        { name: "Produkt C (Linia 4)", pcsInBox: 20, weightPerPc: 0.10, doughWeightFactor: 1.0 }
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
    const finalResult = document.getElementById('final_result');

    if (!boxesInput || !select || !finalResult) return;

    const boxes = parseFloat(boxesInput.value) || 0;
    if (boxes === 0) {
        finalResult.innerText = '0.00';
        return;
    }

    const selectedProductIndex = select.value;
    const product = lineData[activeLine][selectedProductIndex];

    if (product) {
        // 1. Kartony * sztuki w kartonie
        const totalPieces = boxes * product.pcsInBox;

        // 2. Wynik * waga sztuki (np. 0.054)
        const totalWeight = totalPieces * product.weightPerPc;

        // 3. Wynik / waga jednej pełnej dzieży (np. 371)
        const baseDoughMixes = totalWeight / product.doughMixWeight;

        // 4. Dodanie 3% strat produkcyjnych
        const finalMixesWithLoss = baseDoughMixes * 1.03;

        // Wyświetlamy wynik z dokładnością do 3 miejsc po przecinku (tak jak w Twoim przykładzie)
        finalResult.innerText = finalMixesWithLoss.toFixed(3);
    }
}