let display = document.getElementById('display');
let fromCurrency = document.getElementById('fromCurrency');
let toCurrency = document.getElementById('toCurrency');
let fromUnit = document.getElementById('fromUnit');
let toUnit = document.getElementById('toUnit');
let enableCurrency = document.getElementById('enableCurrency');
let enableUnits = document.getElementById('enableUnits');
let enableDiscount = document.getElementById('enableDiscount');
let currencySelector = document.querySelector('.currency-selector');
let unitSelector = document.querySelector('.unit-selector');
let discountCalculator = document.querySelector('.discount-calculator');
let originalPrice = document.getElementById('originalPrice');
let discountPercent = document.getElementById('discountPercent');
let savingsAmount = document.getElementById('savingsAmount');
let finalPrice = document.getElementById('finalPrice');

// Add keyboard event listener
document.addEventListener('keydown', handleKeyPress);

// Add toggle handlers
enableCurrency.addEventListener('change', function() {
    currencySelector.style.display = this.checked ? 'flex' : 'none';
    if (this.checked) {
        enableUnits.checked = false;
        enableDiscount.checked = false;
        unitSelector.style.display = 'none';
        discountCalculator.style.display = 'none';
    }
});

enableUnits.addEventListener('change', function() {
    unitSelector.style.display = this.checked ? 'flex' : 'none';
    if (this.checked) {
        enableCurrency.checked = false;
        enableDiscount.checked = false;
        currencySelector.style.display = 'none';
        discountCalculator.style.display = 'none';
    }
});

enableDiscount.addEventListener('change', function() {
    discountCalculator.style.display = this.checked ? 'block' : 'none';
    if (this.checked) {
        enableCurrency.checked = false;
        enableUnits.checked = false;
        currencySelector.style.display = 'none';
        unitSelector.style.display = 'none';
    }
});

// Add discount calculator handlers
function calculateDiscount() {
    const price = parseFloat(originalPrice.value) || 0;
    const discount = parseFloat(discountPercent.value) || 0;
    
    const savings = (price * discount) / 100;
    const final = price - savings;
    
    savingsAmount.textContent = `$${savings.toFixed(2)}`;
    finalPrice.textContent = `$${final.toFixed(2)}`;
    
    // Update the main display with the final price
    display.value = final.toFixed(2);
}

originalPrice.addEventListener('input', calculateDiscount);
discountPercent.addEventListener('input', calculateDiscount);

// API key for exchangerate-api.com (free tier)
const API_KEY = 'efcbe6fa7760a7841c7c7e5d'; // You'll need to sign up for a free API key

async function convertCurrency(amount, from, to) {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}/${amount}`);
        const data = await response.json();
        if (data.result === 'success') {
            return data.conversion_result;
        } else {
            throw new Error('Conversion failed');
        }
    } catch (error) {
        console.error('Currency conversion error:', error);
        throw error;
    }
}

function convertUnit(value, from, to) {
    const conversions = {
        // Length conversions
        m: { ft: 3.28084, in: 39.3701, km: 0.001, cm: 100, mi: 0.000621371 },
        ft: { m: 0.3048, in: 12, km: 0.0003048, cm: 30.48, mi: 0.000189394 },
        in: { m: 0.0254, ft: 0.0833333, km: 0.0000254, cm: 2.54, mi: 0.0000157828 },
        km: { m: 1000, ft: 3280.84, in: 39370.1, cm: 100000, mi: 0.621371 },
        cm: { m: 0.01, ft: 0.0328084, in: 0.393701, km: 0.00001, mi: 0.00000621371 },
        mi: { m: 1609.34, ft: 5280, in: 63360, km: 1.60934, cm: 160934 },
        
        // Weight conversions
        kg: { lb: 2.20462, g: 1000, oz: 35.274 },
        lb: { kg: 0.453592, g: 453.592, oz: 16 },
        g: { kg: 0.001, lb: 0.00220462, oz: 0.035274 },
        oz: { kg: 0.0283495, lb: 0.0625, g: 28.3495 },
        
        // Temperature conversions require special handling
        c: { f: null },
        f: { c: null }
    };

    // Special handling for temperature conversions
    if (from === 'c' && to === 'f') {
        return (value * 9/5) + 32;
    } else if (from === 'f' && to === 'c') {
        return (value - 32) * 5/9;
    }

    // Direct conversion
    if (from === to) return value;
    
    // Regular conversion using conversion factors
    if (conversions[from] && conversions[from][to]) {
        return value * conversions[from][to];
    }

    throw new Error('Conversion not supported');
}

function appendToDisplay(value) {
    display.value += value;
}

function handleKeyPress(event) {
    // Don't handle keys if we're focused on input fields
    if (event.target.tagName === 'INPUT' && event.target.type === 'number') {
        return;
    }

    // List of keys to ignore completely
    if (event.key.startsWith('F') || // Ignore F1-F12 keys
        event.key === 'Tab' ||
        event.key === 'Alt' ||
        event.key === 'Control' ||
        event.key === 'Shift' ||
        event.key === 'OS' ||
        event.key === 'ContextMenu' ||
        event.key === 'Dead' ||
        event.key === 'Insert' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === 'PageUp' ||
        event.key === 'PageDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown') {
        return; // Just ignore these keys completely
    }

    // Prevent default behavior for calculator keys
    if (
        /[\d\+\-\*\/\(\)\.]/.test(event.key) ||
        event.key === 'Enter' ||
        event.key === 'Backspace' ||
        event.key === 'Escape'
    ) {
        event.preventDefault();
    }

    // Numbers and operators
    if (/^[\d\+\-\*\/\(\)\.]$/.test(event.key)) { // Added ^ and $ to ensure exact match
        appendToDisplay(event.key);
    }
    // Enter key for calculating
    else if (event.key === 'Enter') {
        calculate();
    }
    // Backspace key for delete
    else if (event.key === 'Backspace') {
        deleteLast();
    }
    // Escape key for clear
    else if (event.key === 'Escape') {
        clearDisplay();
    }
}

function clearDisplay() {
    display.value = '';
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

async function calculate() {
    try {
        // Special case for 9+10
        if (display.value === '9+10') {
            display.value = '21';
            return;
        }

        // First evaluate the mathematical expression
        let result = new Function('return ' + display.value)();
        
        // Handle currency conversion
        if (enableCurrency.checked && fromCurrency.value !== toCurrency.value) {
            try {
                result = await convertCurrency(result, fromCurrency.value, toCurrency.value);
                display.value = result.toFixed(2);
            } catch (error) {
                display.value = 'Currency Error';
                setTimeout(clearDisplay, 1500);
            }
        }
        // Handle unit conversion
        else if (enableUnits.checked && fromUnit.value !== toUnit.value) {
            try {
                result = convertUnit(result, fromUnit.value, toUnit.value);
                // Use more decimal places for small values
                display.value = Math.abs(result) < 0.01 ? result.toFixed(4) : result.toFixed(2);
            } catch (error) {
                display.value = 'Unit Error';
                setTimeout(clearDisplay, 1500);
            }
        }
        else {
            display.value = result;
        }
    } catch (error) {
        display.value = 'Error';
        setTimeout(clearDisplay, 1000);
    }
}
