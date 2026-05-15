const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function openPopup(id) {
  document.getElementById(id).style.display = "flex";
}

function closePopup(id) {
  document.getElementById(id).style.display = "none";
}

// Consts

let level = 1

// Level character config: player image and enemy image
const LEVEL_CHARACTERS = {
    1: { player: "images/ninja-1.png.png", enemy: "images/ninjaStar-1.png.png", playerW: 35, playerH: 35, enemyW: 30, enemyH: 30, playerShrink: 10, enemyShrink: 10},
    2: { player: "images/diver-1.png.png", enemy: "images/octo-1.png.png", playerW: 30, playerH: 25, enemyW: 35, enemyH:35, playerShrink: 10, enemyShrink: 10 },
    3: { player: "images/spaceShip-1.png.png", enemy: "images/Alien-1.png (1).png", playerW: 50, playerH: 50, enemyW: 30, enemyH: 30, playerShrink: 13, enemyShrink: 13 },
    4: { player: "images/Knight-1.png.png", enemy: "images/monster-1.png.png", playerW: 28, playerH: 28, enemyW: 35, enemyH:35, playerShrink: 10, enemyShrink: 10 },
    5: { player: "images/skull-1.png.png", enemy: "images/demon-1.png.png", playerW: 28, playerH: 28, enemyW: 40, enemyH:45, playerShrink: 12, enemyShrink: 12 }
}

const urlParams = new URLSearchParams(window.location.search);
let currentLevel = parseInt(urlParams.get("level")) || 1;

const LEVEL_CONFIG = {
    1: {speed: 1.5, blocksPerLane: 2, timeLimit: 30},
    2: {speed: 2, blocksPerLane: 2, timeLimit: 30},
    3: {speed: 3, blocksPerLane: 3, timeLimit: 25},
    4: {speed: 3.5, blocksPerLane: 3, timeLimit: 25},
    5: {speed: 4, blocksPerLane: 4, timeLimit: 20}
}

const playerW = LEVEL_CHARACTERS[currentLevel].playerW;
const playerH = LEVEL_CHARACTERS[currentLevel].playerH;
const enemyW = LEVEL_CHARACTERS[currentLevel].enemyW;
const enemyH = LEVEL_CHARACTERS[currentLevel].enemyH;


const MAX_LEVEL = 5;

function updateBackground(level){
    switch(level){
        case 1: document.body.style.backgroundImage = "url('images/bamboo.png')"; 
        break;
        case 2: document.body.style.backgroundImage = "url('images/ocean.png')";
        break;
        case 3: document.body.style.backgroundImage = "url('images/space.png')";
        break;
        case 4: document.body.style.backgroundImage = "url('images/land.png')";
        break;
        case 5: document.body.style.backgroundImage = "url('images/hell.png')";
        break;
    }
}
updateBackground(currentLevel);

// Preload images for current level
const playerImg = new Image();
playerImg.src = LEVEL_CHARACTERS[currentLevel].player;

const enemyImg = new Image();
enemyImg.src = LEVEL_CHARACTERS[currentLevel].enemy;

let maxObjects = 5
let isHit = false
let gameRunning = true
let hearts = 3
let timeLeft = LEVEL_CONFIG[currentLevel].timeLimit
let timerInterval = null


const rowHeight = canvas.height / 6.5;
console.log(rowHeight)
const rows = [];
for (let i = 0; i <= canvas.height; i += rowHeight) {
    rows.push(i);
}
const playerHeight = 30;

const player = {
    g: 0,
    x: 2,
    y: rows[maxObjects - 1] + rowHeight / 2 - playerH / 2,
    grounded: true,
    currentFrame: 0,
    jumpsLeft: 2
};
const keys = {};

// Event Listeners
document.addEventListener("keydown", (e) => {
    keys[e.key.toLocaleLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key.toLocaleLowerCase()] = false;
});

//Hearts
function drawHearts(){
    ctx.font = "24px Arial";
    for(let i = 0; i < 3; i++){
        ctx.fillStyle = i < hearts ? "red" : "gray";
        ctx.fillText("❤", 10 + i * 30, canvas.height - 10);
    }
    ctx.fillStyle = "black"
    ctx.font= "20px Arial"
    ctx.fillText("Timer: " + timeLeft + "s", canvas.width - 100, canvas.height - 10)
}

//Start Game Timer
function startTimer(){
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!gameRunning) return;
        timeLeft--;
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            gameRunning = false;
            if(currentLevel <= MAX_LEVEL){
                document.getElementById("nextLevelBtn").style.display = "none"
                document.getElementById("homeBtn").style.display = "inline-block"
            }
            openPopup("winPopup");
        }
    }, 1000);
}


// Draw Game
function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    for (let i = 0; i < maxObjects; i++) {
        const laneY = rows[i] + rowHeight;
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(canvas.width, laneY);
        ctx.stroke();
    }

    // Draw player using image
    ctx.drawImage(playerImg, player.x, player.y, playerW, playerH);

    // Draw enemy objects using image
    for (let i = 0; i < objects.length; i++) {
        ctx.drawImage(enemyImg, objects[i].x, objects[i].y, enemyW, enemyH);
    }

    drawHearts();
}

// Player Control 
function jump() {
    function closestRowIndex() {
        let best = 0;
        let bestDist = Infinity;
        for (let i = 0; i <= maxObjects; i++) {
            const dist = Math.abs(player.y - (rows[i] + rowHeight / 2 - playerH / 2));
            if (dist < bestDist) { bestDist = dist; best = i; }
        }
        return best;
    }

    if (keys["arrowup"] && player.grounded) {
        const currentRowIndex = closestRowIndex();
        if (keys["arrowup"] && player.jumpsLeft > 0 && currentRowIndex > 0) {
            player.grounded = false;
            player.jumpsLeft--;
            player.targetY = rows[currentRowIndex - 1] + rowHeight / 2 - playerH / 2;
        }
    }

    if (keys["arrowdown"] && player.jumpsLeft > 0 ) {
        const currentRowIndex = closestRowIndex();
        if (currentRowIndex < maxObjects - 1) {
            player.grounded = false;
            player.jumpsLeft--;
            player.targetY = rows[currentRowIndex + 1] + rowHeight / 2 - playerH / 2;
        }
    }

    if (player.targetY !== undefined && player.y !== player.targetY) {
        player.y += (player.targetY - player.y) * 0.2;
        if (Math.abs(player.y - player.targetY) < 0.5) {
            player.y = player.targetY;
            player.grounded = true;
            player.jumpsLeft = 2;
            delete player.targetY;
        }
    }
}

//OBJECTS

let objects = []
const blocksPerLane = LEVEL_CONFIG[currentLevel].blocksPerLane
const blockMinSpacing = 200

function createObjetcs() {
    const config = LEVEL_CONFIG[currentLevel];

    objects = []
    for (let lane = 0; lane < maxObjects; lane++) {
        let lastX = canvas.width;
        for (let i = 0; i < blocksPerLane; i++){
            let spacing = blockMinSpacing + Math.random() * 100;
            objects.push({
                x: lastX + spacing,
                y: rows[lane] + rowHeight / 2 - enemyH / 2,
                width: enemyW,
                height: enemyH,
                speed: config.speed + Math.random() * 1.5,
                color: "red",
                lane: lane
            });
            lastX = objects[objects.length - 1].x + objects[objects.length - 1].width + blockMinSpacing || 0
        }
    }
}
createObjetcs()

function moveObjects(){
    for(let obj of objects){
        obj.x -= obj.speed;
        if(obj.x + obj.width < 0){
            let laneBlocks = objects.filter(o => o.lane === obj.lane && o !== obj);
            let maxX = Math.max(...laneBlocks.map(o => o.x + o.width), canvas.width);
            obj.x = maxX + blockMinSpacing + Math.random() * 100;
            obj.y = rows[obj.lane] + rowHeight / 2 - enemyH / 2;
            obj.speed = LEVEL_CONFIG[currentLevel].speed + Math.random() * 1.5;
        }
    }
}

//reset game when hit
function resetGame() {
    hearts = 3
    timeLeft = LEVEL_CONFIG[currentLevel].timeLimit
    closePopup("winPopup");
    startTimer();

    isHit = false;
    gameRunning = true;
    player.x = 2;
    player.y = rows[maxObjects - 1] + rowHeight / 2 - playerH / 2;
    player.grounded = true;
    delete player.targetY;
    createObjetcs();
    closePopup("hitPopup")
    update();
}

//Collision Detection
function checkCollision(){
    const cfg = LEVEL_CHARACTERS[currentLevel]
    const ps = cfg.playerShrink;
    const es = cfg.enemyShrink;
    for(let obj of objects){
        if(
            player.x + ps < obj.x + obj.width - es &&
            player.x + playerW - ps > obj.x + es &&
            player.y + ps < obj.y + obj.height - es && 
            player.y + playerH - ps > obj.y + es
        ){
            hearts--;
            isHit = true;
            obj.x = -(obj.width + 10);
            if(hearts <= 0){
                gameRunning = false;
                clearInterval(timerInterval);
                openPopup("hitPopup");
            }
        }
    }
}

function goNextLevel(){
    if(currentLevel < MAX_LEVEL){
        window.location.href = "game.html?level=" + (currentLevel + 1);
    }
}

function update() {
    if(!gameRunning) return;
    draw();
    jump();
    moveObjects();
    checkCollision();
    requestAnimationFrame(update);
}
startTimer();
update();
