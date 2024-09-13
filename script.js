const welcomeScreen = document.getElementById('welcome-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const target = document.getElementById('target');
const gameOver = document.getElementById('game-over');
const win = document.getElementById('win');

let gameRunning = false;
let playerX = 0;
let playerY = 0;
let targetX = 0;
let targetY = 0;
let circles = [];
let obstacles = [];
const obstacleCount = 5;

// Increase player speed
const playerSpeed = 20; // Increased from 10 to 20

let keysPressed = {};

function movePlayer() {
    let newX = playerX;
    let newY = playerY;
    let moveDiagonal = false;

    if (keysPressed['w'] && keysPressed['a']) {
        newY -= playerSpeed * 0.707; // Diagonal movement (sin(45°))
        newX -= playerSpeed * 0.707; // Diagonal movement (cos(45°))
        moveDiagonal = true;
    } else if (keysPressed['w'] && keysPressed['d']) {
        newY -= playerSpeed * 0.707;
        newX += playerSpeed * 0.707;
        moveDiagonal = true;
    } else if (keysPressed['s'] && keysPressed['a']) {
        newY += playerSpeed * 0.707;
        newX -= playerSpeed * 0.707;
        moveDiagonal = true;
    } else if (keysPressed['s'] && keysPressed['d']) {
        newY += playerSpeed * 0.707;
        newX += playerSpeed * 0.707;
        moveDiagonal = true;
    }

    if (!moveDiagonal) {
        if (keysPressed['w']) newY -= playerSpeed;
        if (keysPressed['a']) newX -= playerSpeed;
        if (keysPressed['s']) newY += playerSpeed;
        if (keysPressed['d']) newX += playerSpeed;
    }

    newX = Math.max(0, Math.min(gameContainer.clientWidth - 50, newX));
    newY = Math.max(0, Math.min(gameContainer.clientHeight - 50, newY));

    if (!checkObstacleCollision(newX, newY, 50, 50)) {
        playerX = newX;
        playerY = newY;
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }
    
    if (checkCollision(playerX, playerY, 50, 50, targetX, targetY, 50, 50)) {
        endGame(true);
    }
}

function handleKeyDown(e) {
    keysPressed[e.key.toLowerCase()] = true;
}

function handleKeyUp(e) {
    keysPressed[e.key.toLowerCase()] = false;
}

let targetSpeed = {
    x: 0,
    y: 0
};

const MAX_SPEED = 12; // Increased maximum speed

function updateRiriDirection() {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * MAX_SPEED + MAX_SPEED / 2; // Speed between MAX_SPEED/2 and MAX_SPEED
    targetSpeed.x = speed * Math.cos(angle);
    targetSpeed.y = speed * Math.sin(angle);
}

function randomPosition() {
    return {
        x: Math.random() * (gameContainer.clientWidth - 50),
        y: Math.random() * (gameContainer.clientHeight - 50)
    };
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    const width = Math.random() * 100 + 50;
    const height = Math.random() * 100 + 50;
    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    
    let pos;
    do {
        pos = randomPosition();
    } while (checkObstacleCollision(pos.x, pos.y, width, height));
    
    obstacle.style.left = `${pos.x}px`;
    obstacle.style.top = `${pos.y}px`;
    
    obstacles.push({ element: obstacle, x: pos.x, y: pos.y, width, height });
    gameContainer.appendChild(obstacle);
}

function checkObstacleCollision(x, y, width, height) {
    for (let obstacle of obstacles) {
        if (checkCollision(x, y, width, height, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
            return true;
        }
    }
    return false;
}

function moveTarget() {
    let newX = targetX + targetSpeed.x;
    let newY = targetY + targetSpeed.y;

    // Randomly change direction occasionally
    if (Math.random() < 0.05) { // 5% chance each frame to change direction
        updateRiriDirection();
    }

    if (checkObstacleCollision(newX, newY, 50, 50)) {
        // Bounce off obstacle with a new random direction
        updateRiriDirection();
        newX = targetX + targetSpeed.x;
        newY = targetY + targetSpeed.y;
    }

    if (newX <= 0 || newX >= gameContainer.clientWidth - 50) {
        targetSpeed.x *= -1;
        newX = targetX + targetSpeed.x;
        // Add some randomness to y-speed when bouncing off horizontal walls
        targetSpeed.y += (Math.random() - 0.5) * 5;
    }
    if (newY <= 0 || newY >= gameContainer.clientHeight - 50) {
        targetSpeed.y *= -1;
        newY = targetY + targetSpeed.y;
        // Add some randomness to x-speed when bouncing off vertical walls
        targetSpeed.x += (Math.random() - 0.5) * 5;
    }

    // Ensure speed doesn't exceed MAX_SPEED
    const currentSpeed = Math.sqrt(targetSpeed.x ** 2 + targetSpeed.y ** 2);
    if (currentSpeed > MAX_SPEED) {
        targetSpeed.x = (targetSpeed.x / currentSpeed) * MAX_SPEED;
        targetSpeed.y = (targetSpeed.y / currentSpeed) * MAX_SPEED;
    }

    targetX = newX;
    targetY = newY;
    target.style.left = `${targetX}px`;
    target.style.top = `${targetY}px`;
}

function createCircle() {
    const circle = document.createElement('div');
    circle.classList.add('circle');
    const size = Math.random() * 30 + 20;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    
    const pos = randomPosition();
    circle.style.left = `${pos.x}px`;
    circle.style.top = `${pos.y}px`;
    
    const speed = {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5
    };
    
    circles.push({ element: circle, x: pos.x, y: pos.y, speed });
    gameContainer.appendChild(circle);
}

function moveCircles() {
    circles.forEach(circle => {
        let newX = circle.x + circle.speed.x;
        let newY = circle.y + circle.speed.y;
        
        if (checkObstacleCollision(newX, newY, parseInt(circle.element.style.width), parseInt(circle.element.style.height))) {
            circle.speed.x *= -1;
            circle.speed.y *= -1;
            newX = circle.x + circle.speed.x;
            newY = circle.y + circle.speed.y;
        }
        
        if (newX <= 0 || newX >= gameContainer.clientWidth - parseInt(circle.element.style.width)) {
            circle.speed.x *= -1;
            newX = circle.x + circle.speed.x;
        }
        if (newY <= 0 || newY >= gameContainer.clientHeight - parseInt(circle.element.style.height)) {
            circle.speed.y *= -1;
            newY = circle.y + circle.speed.y;
        }
        
        circle.x = newX;
        circle.y = newY;
        circle.element.style.left = `${circle.x}px`;
        circle.element.style.top = `${circle.y}px`;
        
        if (checkCollision(playerX, playerY, 50, 50, circle.x, circle.y, parseInt(circle.element.style.width), parseInt(circle.element.style.height))) {
            endGame(false);
        }
    });
}

function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function endGame(won) {
    gameRunning = false;
    if (won) {
        win.style.display = 'block';
    } else {
        gameOver.style.display = 'block';
    }
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    circles.forEach(circle => circle.element.remove());
    circles = [];
    obstacles.forEach(obstacle => obstacle.element.remove());
    obstacles = [];
}

function startGame() {
    welcomeScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameOver.style.display = 'none';
    win.style.display = 'none';
    
    const playerPos = randomPosition();
    playerX = playerPos.x;
    playerY = playerPos.y;
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    
    // Spawn Riri randomly
    const targetPos = randomPosition();
    targetX = targetPos.x;
    targetY = targetPos.y;
    target.style.left = `${targetX}px`;
    target.style.top = `${targetY}px`;
    
    // Initialize Riri's speed
    updateRiriDirection();
    
    gameRunning = true;
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Change the interval to 250 milliseconds (0.25 seconds)
    const circleSpawnInterval = setInterval(() => {
        if (gameRunning) {
            createCircle();
        } else {
            clearInterval(circleSpawnInterval);
        }
    }, 250);
    
    function gameLoop() {
        if (gameRunning) {
            moveCircles();
            moveTarget();
            movePlayer();
            requestAnimationFrame(gameLoop);
        }
    }
    gameLoop();
}

startButton.addEventListener('click', startGame);

// Welcome screen animation
function createBackgroundCircle() {
    const circle = document.createElement('div');
    circle.classList.add('circle');
    const size = Math.random() * 50 + 20;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 50%, 0.5)`;
    
    const pos = randomPosition();
    circle.style.left = `${pos.x}px`;
    circle.style.top = `${pos.y}px`;
    
    const speed = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
    };
    
    welcomeScreen.appendChild(circle);
    
    function animateCircle() {
        pos.x += speed.x;
        pos.y += speed.y;
        
        if (pos.x <= 0 || pos.x >= window.innerWidth - size) {
            speed.x *= -1;
        }
        if (pos.y <= 0 || pos.y >= window.innerHeight - size) {
            speed.y *= -1;
        }
        
        circle.style.left = `${pos.x}px`;
        circle.style.top = `${pos.y}px`;
        
        requestAnimationFrame(animateCircle);
    }
    animateCircle();
}

for (let i = 0; i < 20; i++) {
    createBackgroundCircle();
}

// Add CSS for obstacles
const style = document.createElement('style');
style.textContent = `
    .obstacle {
        position: absolute;
        background-color: #16213e;
        border: 2px solid #0f3460;
    }
`;
document.head.appendChild(style);
