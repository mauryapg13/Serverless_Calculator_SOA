const resultDisplay = document.getElementById('result');
const historyDisplay = document.getElementById('history');
const keys = document.querySelector('.keypad');

let currentOperand = '0';
let previousOperand = '';
let operation = undefined;
let shouldResetDisplay = false;

function updateDisplay() {
    resultDisplay.innerText = currentOperand;
    if (operation != null) {
        let opSymbol = '';
        if (operation === 'add') opSymbol = '+';
        if (operation === 'subtract') opSymbol = '−';
        if (operation === 'multiply') opSymbol = '×';
        if (operation === 'divide') opSymbol = '÷';
        historyDisplay.innerText = `${previousOperand} ${opSymbol}`;
    } else {
        historyDisplay.innerText = '';
    }
}

function appendNumber(number) {
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        if (number === '.' && currentOperand.includes('.')) return;
        if (shouldResetDisplay) {
            currentOperand = number;
            shouldResetDisplay = false;
        } else {
            currentOperand = currentOperand.toString() + number.toString();
        }
    }
}

function chooseOperation(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        // If we already have an operation queued, wait for user to calculate first, or chain them
        // For simplicity, we just change the operation.
    }
    operation = op;
    previousOperand = currentOperand;
    shouldResetDisplay = true;
}

function clear() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    shouldResetDisplay = false;
}

function deleteNumber() {
    if (shouldResetDisplay) return;
    currentOperand = currentOperand.toString().slice(0, -1);
    if (currentOperand === '') currentOperand = '0';
}

async function calculate() {
    if (operation == null || previousOperand === '') return;
    if (shouldResetDisplay) {
        currentOperand = previousOperand;
    }
    
    let a = parseFloat(previousOperand);
    let b = parseFloat(currentOperand);
    let op = operation;

    // Show loading state
    resultDisplay.classList.add('loading');
    
    try {
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                operation: op,
                a: a,
                b: b
            })
        });
        
        const data = await response.json();
        
        if (data.statusCode === 200) {
            currentOperand = data.result.toString();
            operation = undefined;
            previousOperand = '';
        } else {
            currentOperand = 'Error';
            historyDisplay.innerText = data.result || 'Server Error';
            operation = undefined;
            previousOperand = '';
        }
    } catch (error) {
        currentOperand = 'Error';
        historyDisplay.innerText = 'Network Error';
        operation = undefined;
        previousOperand = '';
    } finally {
        resultDisplay.classList.remove('loading');
        shouldResetDisplay = true;
        updateDisplay();
    }
}

keys.addEventListener('click', e => {
    if (!e.target.matches('button')) return;
    
    const key = e.target;
    const action = key.dataset.action;
    
    if (!action && key.classList.contains('number')) {
        appendNumber(key.innerText);
        updateDisplay();
    } else if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') {
        chooseOperation(action);
        updateDisplay();
    } else if (action === 'calculate') {
        calculate();
    } else if (action === 'clear') {
        clear();
        updateDisplay();
    } else if (action === 'delete') {
        deleteNumber();
        updateDisplay();
    }
});

updateDisplay();
