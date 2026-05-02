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
        if (currentOperand === '1337' && operation == null) {
            startSnakeGame();
            return;
        }
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

// --- Snake Game Easter Egg ---
const displayEl = document.querySelector('.display');
const keypadEl = document.querySelector('.keypad');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('game-score');
const exitBtn = document.getElementById('exit-game');

let snake = [];
let food = {};
let dx = 10;
let dy = 0;
let score = 0;
let gameInterval;
const gridSize = 10;

function startSnakeGame() {
    displayEl.style.display = 'none';
    keypadEl.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    snake = [
        {x: 150, y: 150},
        {x: 140, y: 150},
        {x: 130, y: 150}
    ];
    dx = 10;
    dy = 0;
    score = 0;
    scoreEl.innerText = 'Score: ' + score;
    spawnFood();
    
    document.addEventListener('keydown', changeDirection);
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(mainLoop, 100);
}

function mainLoop() {
    if (hasGameEnded()) {
        clearInterval(gameInterval);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Inter';
        ctx.fillText('Game Over', 95, 145);
        return;
    }
    
    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnakePart(snakePart, isHead) {
    ctx.fillStyle = isHead ? '#ffffff' : '#cccccc';
    ctx.strokeStyle = '#000000';
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach((part, index) => drawSnakePart(part, index === 0));
}

function advanceSnake() {
    let newX = snake[0].x + dx;
    let newY = snake[0].y + dy;

    if (newX < 0) newX = canvas.width - gridSize;
    else if (newX >= canvas.width) newX = 0;
    
    if (newY < 0) newY = canvas.height - gridSize;
    else if (newY >= canvas.height) newY = 0;

    const head = {x: newX, y: newY};
    snake.unshift(head);
    
    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreEl.innerText = 'Score: ' + score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function spawnFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
    
    // Make sure food doesn't spawn on snake
    snake.forEach(function isFoodOnSnake(part) {
        if (part.x == food.x && part.y == food.y) spawnFood();
    });
}

function drawFood() {
    ctx.fillStyle = '#ff3333';
    ctx.strokeStyle = '#000';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    if (keyPressed === LEFT_KEY && !goingRight) { dx = -gridSize; dy = 0; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -gridSize; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = gridSize; dy = 0; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = gridSize; }
}

function hasGameEnded() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

exitBtn.addEventListener('click', () => {
    clearInterval(gameInterval);
    document.removeEventListener('keydown', changeDirection);
    gameContainer.style.display = 'none';
    displayEl.style.display = 'flex';
    keypadEl.style.display = 'grid';
    clear();
    updateDisplay();
});
