const blocks = [
    {shape: [[1, 1, 1, 1]], color: 'cyan'},
    {shape: [[1, 1], [1, 1]], color: 'yellow'},
    {shape: [[1, 1, 0], [0, 1, 1]], color: 'red'},
    {shape: [[0, 1, 1], [1, 1]], color: 'green'},
    {shape: [[1, 1, 1], [0, 1, 0]], color: 'purple'},
    {shape: [[1, 1, 1], [1, 0, 0]], color: 'orange'},
    {shape: [[1, 1, 1], [0, 0, 1]], color: 'blue'}
];

function generateBlock() {
    return copyBlock(blocks[Math.floor(Math.random() * blocks.length)]);
}

let score;
let currentBlock;
let currentBlockPos;
let nextBlock;
let gameLoop;
let gamePaused;
let gameOver;

let board = Array(20).fill().map(() => Array(10).fill(0));

function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }

    score = 0;
    currentBlock = generateBlock();
    currentBlockPos = {x: 5, y: 0};
    nextBlock = generateBlock();
    gameLoop = setInterval(updateGame, 1000);
    gamePaused = false;
    gameOver = false;
}

document.getElementById('pause-button').addEventListener('click', togglePause);

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pause-button').textContent = gamePaused ? 'Resume' : 'Pause';
    gamePaused ? clearInterval(gameLoop) : gameLoop = setInterval(updateGame, 1000);
}

function drawBoard() {
    let gameBoard = document.getElementById('game-board');

    gameBoard.innerHTML = '';

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            let block = createBlock(y, x);

            if (block) {
                gameBoard.appendChild(block);
            }
        }
    }
}

function createBlock(y, x) {
    let block = document.createElement('div');

    block.style.top = `${y * 20}px`;
    block.style.left = `${x * 20}px`;
    block.className = 'block';

    if (board[y][x] !== 0) {
        block.style.backgroundColor = board[y][x];
        return block;
    } else if (isCurrentBlock(y, x)) {
        block.style.backgroundColor = currentBlock.color;
        return block;
    }

    return null;
}

function isCurrentBlock(y, x) {
    let withinYBounds = y >= currentBlockPos.y && y < currentBlockPos.y + currentBlock.shape.length;
    let withinXBounds = x >= currentBlockPos.x && x < currentBlockPos.x + currentBlock.shape[0].length;
    let withinShape = y - currentBlockPos.y < currentBlock.shape.length && x - currentBlockPos.x < currentBlock.shape[0].length;

    return withinYBounds && withinXBounds && withinShape && currentBlock.shape[y - currentBlockPos.y][x - currentBlockPos.x];
}

document.getElementById('start-button').addEventListener('click', startGame);

function updateGame() {
    if (gameOver || gamePaused) return;

    moveCurrentBlockDown();

    if (hasCollision()) {
        revertBlockPosition();

        if (checkLanded()) {
            addBlockToBoard();
            checkGameOver();
            generateNewBlock();
            removeFilledLines();
        }
    }

    drawBoard();
    drawNextBlock();
}

function moveCurrentBlockDown() {
    currentBlockPos.y++;
}

function revertBlockPosition() {
    currentBlockPos.y--;
}

function addBlockToBoard() {
    for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
            if (currentBlock.shape[y][x]) {
                board[currentBlockPos.y + y][currentBlockPos.x + x] = currentBlock.color;
            }
        }
    }
}

function checkGameOver() {
    if (isGameOver()) {
        gameOver = true;

        showGameOverNotification();
    }
}

function generateNewBlock() {
    currentBlock = copyBlock(nextBlock);
    nextBlock = generateBlock();
    currentBlockPos = {x: 5, y: 0};
}

function isGameOver() {
    for (let x = 0; x < board[0].length; x++) {
        if (board[0][x] !== 0) {
            return true;
        }
    }

    return false;
}

function showGameOverNotification() {
    const gameOverNotification = document.getElementById('game-over');

    gameOverNotification.style.display = 'block';
}

function removeFilledLines() {
    let linesToRemove = [];

    for (let y = 0; y < board.length; y++) {
        if (board[y].every(cell => cell !== 0)) {
            linesToRemove.push(y);
        }
    }

    for (let y of linesToRemove) {
        board.splice(y, 1);
        board.unshift(Array(10).fill(0));
    }

    switch (linesToRemove.length) {
        case 1:
            score += 10;
            break;
        case 2:
            score += 20;
            break;
        case 3:
            score += 30;
            break;
        case 4:
            score += 50;
            break;
    }

    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score ${score}`;
}

function copyBlock(block) {
    return {
        color: block.color,
        shape: block.shape.map(row => [...row])
    };
}

function drawNextBlock() {
    let nextBlockDiv = document.getElementById('next-block');

    nextBlockDiv.innerHTML = '';

    for (let y = 0; y < nextBlock.shape.length; y++) {
        for (let x = 0; x < nextBlock.shape[y].length; x++) {
            if (nextBlock.shape[y][x]) {
                let block = document.createElement('div');
                block.style.top = `${y * 20}px`;
                block.style.left = `${x * 20}px`;
                block.className = 'block';
                block.style.backgroundColor = nextBlock.color;
                nextBlockDiv.appendChild(block);
            }
        }
    }
}

function hasCollision() {
    for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
            let newY = currentBlockPos.y + y;
            let newX = currentBlockPos.x + x;

            if (currentBlock.shape[y][x] && (newY < 0 || newY >= board.length || newX < 0 || newX >= board[0].length || board[newY][newX] !== 0)) {
                return true;
            }
        }
    }

    return false;
}

function checkLanded() {
    for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
            if (currentBlock.shape[y][x] && (currentBlockPos.y + y + 1 >= board.length || board[currentBlockPos.y + y + 1][currentBlockPos.x + x] !== 0)) {
                return true;
            }
        }
    }

    return false;
}

function fixBlock() {
    for (let y = 0; y < currentBlock.length; y++) {
      for (let x = 0; x < currentBlock[y].length; x++) {
        if (currentBlock[y][x]) {
          board[currentBlockPos.y + y][currentBlockPos.x + x] = 1;
        }
      }
    }
  }

function checkLines() {
    for (let y = board.length - 1; y >= 0; y--) {
      if (board[y].every(value => value !== 0)) {
        board.splice(y, 1);
        board.unshift(Array(10).fill(0));
        score++;
      }
    }
  }

  function rotateBlock() {
    let originalShape = currentBlock.shape;
    let newShape = originalShape[0].map((_, index) => originalShape.map(row => row[index])).reverse();

    if (isValidMove(newShape, currentBlockPos.x, currentBlockPos.y)) {
        currentBlock.shape = newShape;
    }
}

function isValidMove(shape, dx, dy) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            let newY = dy + y;
            let newX = dx + x;

            if (shape[y][x] && (newY < 0 || newY >= board.length || newX < 0 || newX >= board[0].length || board[newY][newX] !== 0)) {
                return false;
            }
        }
    }

    return true;
}



const keyActions = {
    'ArrowLeft': function() {
        currentBlockPos.x--;
        if (hasCollision()) currentBlockPos.x++;
    },
    'ArrowRight': function() {
        currentBlockPos.x++;
        if (hasCollision()) currentBlockPos.x--;
    },
    'ArrowDown': function() {
        currentBlockPos.y++;
        if (hasCollision()) currentBlockPos.y--;
    },
    'ArrowUp': function() {
        let originalShape = currentBlock.shape;
        rotateBlock();
        if (hasCollision()) {
            currentBlock.shape = originalShape;
        }
    }
};

window.addEventListener('keydown', function(e) {
    if (keyActions[e.key]) {
        keyActions[e.key]();
    }
});

document.getElementById('start-button').addEventListener('click', startNewGame);

function startNewGame() {
    board = Array(20).fill().map(() => Array(10).fill(0));
    currentBlock = generateBlock();
    currentBlockPos = {x: 5, y: 0};
    score = 0;
    gameOver = false;

    document.getElementById('game-over').style.display = 'none';
    updateScoreDisplay();
    updateGame();
}

document.getElementById('pause-button').addEventListener('click', togglePause);

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pause-button').textContent = gamePaused ? 'Resume' : 'Pause';
}
