const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const frog = {
  x: canvas.width / 6, // Adjust the frog's starting x-position
  y: canvas.height / 2,
  width: 90,
  height: 90,
  speed: 0,
  gravity: 0.2,
};

const backgroundImages = [];
let currentLevel = 1;
let backgroundCanvas;
let background2X;
let backgroundX = 0;

const obstacleTemplates = [
  { height: 50, gap: 150 },
  { height: 100, gap: 100 },
  { height: 200, gap: 50 },
  // Add more templates as needed
];


const loadingScreenImg = new Image();
loadingScreenImg.src = 'assets/bg_l01.png';


const frogImg = new Image();
frogImg.src = "assets/frog.idl.svg";

const frogUpImg = new Image();
frogUpImg.src = "assets/frog.idl_up.svg";

const frogDownImg = new Image();
frogDownImg.src = "assets/frog.idl_dn.svg";

let frogCatchImageLoaded = false;

let frogCatchImg = new Image();
frogCatchImg.src = "assets/frog.idl_c.svg";
frogCatchImg.onload = function () {
  frogCatchImageLoaded = true;
};


let frogImageLoaded = false;
frogImg.addEventListener("load", function() {
  frogImageLoaded = true;
});

const flyImages = [];
const numFlyImages = 3; // Change this to the number of pair images you have

let baseObstacleSpeed = 1.5;
let baseFlySpeed = 3;
let baseMagicPotionSpeed = 2;

const originalBaseObstacleSpeed = 3;
const originalBaseFlySpeed = 4;
const originalBaseMagicPotionSpeed = 2;



for (let i = 1; i <= numFlyImages; i++) {
  const flyImg = new Image();
  flyImg.src = `assets/fly${i}.svg`;
  flyImages.push(flyImg);
}

const magicPotionImg = new Image();
magicPotionImg.src = "assets/magic_potion.svg"; 

// ignore all Gradients , coming from old verstion 

const frogGradient = ctx.createRadialGradient(frog.x + frog.width / 2, frog.y + frog.height / 2, 0, frog.x + frog.width / 2, frog.y + frog.height / 2, frog.width / 2);
frogGradient.addColorStop(0, "blue");
frogGradient.addColorStop(1, "cyan");

const obstacleGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
obstacleGradient.addColorStop(0, "#FF290B");
obstacleGradient.addColorStop(1, "#AD0000");

let obstacles = [];
let flies = [];
let magicSlimePotions = [];
let frameCount = 0;
let score = 0;
let gameSpeed = 3;
let gameOver = false;
let startOverButtonCreated = false;

 // BG audio
let backgroundMusic = new Audio('assets/audio/R4_hit the dex.mp3');
backgroundMusic.loop = true; // This will make the audio file loop

let isMusicOn = true; // This will track whether the music is currently playing
let soundEnabled = true; // Default state is on
let speakerOnImg = new Image();
let speakerOffImg = new Image();
speakerOnImg.src = 'assets/audio_on.png';
speakerOffImg.src = 'assets/audio_off.png';


let flyCatchSound1 = new Audio('assets/audio/l1.mp3');
let flyCatchSound2 = new Audio('assets/audio/l2.mp3');
let flyCatchSound3 = new Audio('assets/audio/l3.mp3');
let magicPotionCatchSound = new Audio('assets/audio/m1.mp3');
let obstacleHitSound = new Audio('assets/audio/k1.mp3');



function playSound(audioElement) {
  // Restart the audio file
  audioElement.currentTime = 0;
  
  // Play the audio file
  audioElement.play();
}


function drawPlayButton(ctx) {
  ctx.fillStyle = '#ff0000'; // Choose a color for the button
  ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50); // Draw the button

  ctx.font = '24px Arial';
  ctx.fillStyle = '#ffffff'; // Choose a color for the text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Play', canvas.width / 2, canvas.height / 2);
}


function drawLoadingScreen(ctx) {
  ctx.drawImage(loadingScreenImg, 0, 0, canvas.width, canvas.height);
  drawPlayButton(ctx);
}


let gameStarted = false;


canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check if the click is within the Play button
  if (x >= canvas.width / 2 - 50 && x <= canvas.width / 2 + 50 && y >= canvas.height / 2 - 25 && y <= canvas.height / 2 + 25) {
    gameStarted = true;
  }
});



// Draw the speaker button
function drawSpeakerButton() {
  const speakerImg = isMusicOn ? speakerOnImg : speakerOffImg;
  ctx.drawImage(speakerImg, canvas.width - speakerImg.width - 10, canvas.height - speakerImg.height - 10);
}


canvas.addEventListener('click', function(e) {
  // Get the mouse position
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  // Check if the speaker button was clicked
  if (x >= canvas.width - speakerOnImg.width - 10 && x <= canvas.width - 10 && y >= canvas.height - speakerOnImg.height - 10 && y <= canvas.height - 10) {
    isMusicOn = !isMusicOn; // Toggle the music state

    // Play or pause the music
    if (isMusicOn) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  } else {
    // If the speaker button was not clicked, call your existing jump function
    jump();
  }
});


function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    speakerButtonImage.src = speakerOnImg.src;
  } else {
    speakerButtonImage.src = speakerOffImg.src;
  }
}





(async function() {
  for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `assets/bg_l0${i}.png`;

    await new Promise(resolve => {
      img.onload = () => {
        resolve();
      };
    });

    const offscreenCanvas = drawBackgroundImageToCanvas(img);
    backgroundImages.push(offscreenCanvas);
  }

  // Set the initial background canvas
  backgroundCanvas = backgroundImages[currentLevel - 1];
  background2X = canvas.width;

  requestAnimationFrame(draw);
  requestAnimationFrame(update);
})();

async function updateBackgroundImage(level) {
  const newBackgroundImage = new Image();
  newBackgroundImage.src = `assets/bg_l${level}.svg`;

  await new Promise((resolve) => {
    newBackgroundImage.onload = () => {
      resolve();
    };
  });

  //backgroundImage.src = newBackgroundImage.src;
  backgroundCanvas = drawBackgroundImageToCanvas(backgroundImage);
}


async function checkForLevelCompletion() {
  for (let i = 0; i < levelScoreThresholds.length; i++) {
    if (score >= levelScoreThresholds[i] && currentLevel !== i + 1) {
      currentLevel = i + 1;
      await updateBackgroundImage(currentLevel);
      break;
    }
  }
}


function changeFrogImage(imageFile) {
    frogImage.src = imageFile;
}

function catchFly() {
  const distance = Math.hypot(frog.x - fly.x, frog.y - fly.y);
  if (distance < 20) {
    changeFrogImage("assets/frog.idl_c.svg");
    flyCaught = true;
  }
}


function isLevelCompleted() {
  // level is completed when the score reaches xx number , 20 is only for testing 
  return score >= currentLevel * 10;
}


function changeLevel() {
  currentLevel++;

  if (currentLevel > 6) {
    // If all levels are completed, display a victory message or restart the game
    gameOver = true;
    displayVictory();
    return;
  }

  // Update speeds based on the new level
  if (currentLevel > 1) { // Keep the level one speed the same
    baseObstacleSpeed += 24; // 6x the original speed increase for obstacles
    baseFlySpeed += 24; // 6x the original speed increase for flies
    baseMagicPotionSpeed += 24; // 6x the original speed increase for magic potions
  }

  updateBackgroundImage(currentLevel); // Call updateBackgroundImage() to update the background
  backgroundCanvas = backgroundImages[currentLevel - 1];

  // Reset the backgroundX and background2X values
  backgroundX = 0;
  background2X = canvas.width;
}



function showLevelCompleteScreen(level) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = '32px Arial';
  ctx.fillText(`Level ${level} Complete!`, canvas.width / 2 - 100, canvas.height / 2 - 50);

  const button = document.createElement('button');
  button.innerText = 'Start Next Level';
  button.style.position = 'absolute';
  button.style.left = `${canvas.width / 2 - 50}px`;
  button.style.top = `${canvas.height / 2}px`;
  button.onclick = () => {
    document.body.removeChild(button);
    startNextLevel();
  };

  document.body.appendChild(button);
}

function levelComplete() {
  clearInterval(gameInterval);
  showLevelCompleteScreen(currentLevel);
}

function startNextLevel() {
  currentLevel++;
  setupLevel(currentLevel);
  gameInterval = setInterval(gameLoop, 1000 / FPS);
}


function drawBackgroundImageToCanvas(img) {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;

  const offscreenCtx = offscreenCanvas.getContext("2d");
  offscreenCtx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

  return offscreenCanvas;
}


function jump() {
  if (frog.y > 0) {
    frog.speed = -6;
    frog.vy = frog.speed;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Define the drawRoundedRect function inside the draw function
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  // Update the background's X position
  backgroundX -= 0.5; // Adjust the speed of the scrolling background here
  background2X -= 0.5;

  if (backgroundX <= -backgroundCanvas.width) {
    backgroundX = backgroundCanvas.width;
  }
  if (background2X <= -backgroundCanvas.width) {
    background2X = backgroundCanvas.width;
  }

  // Draw the background image
  ctx.drawImage(backgroundCanvas, backgroundX, 0, backgroundCanvas.width, canvas.height);
  ctx.drawImage(backgroundCanvas, background2X, 0, backgroundCanvas.width, canvas.height);

  if (!gameOver) {
    // Draw frog
    if (frogImageLoaded) {
      if (frog.vy < -1) {
        ctx.drawImage(frogUpImg, frog.x, frog.y, frog.width, frog.height);
      } else if (frog.vy > 1) {
        ctx.drawImage(frogDownImg, frog.x, frog.y, frog.width, frog.height);
      } else {
        ctx.drawImage(frogImg, frog.x, frog.y, frog.width, frog.height);
      }
    }

    // Draw obstacles
    ctx.fillStyle = obstacleGradient;
    for (let i = 0; i < obstacles.length; i++) {
      ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
    }

    // Draw flies
    for (let i = 0; i < flies.length; i++) {
      ctx.drawImage(flies[i].image, flies[i].x, flies[i].y, flies[i].width, flies[i].height);
    }

    // Draw magic slime potions
    for (let i = 0; i < magicSlimePotions.length; i++) {
      ctx.drawImage(
        magicSlimePotions[i].image,
        magicSlimePotions[i].x,
        magicSlimePotions[i].y,
        magicSlimePotions[i].width,
        magicSlimePotions[i].height
      );
    }
	  
	 // Draw the speaker button
    drawSpeakerButton();

    // Draw background for score
    ctx.fillStyle = "rgba(25, 25, 25, 0.9)"; // Set the background color with 90% opacity
    drawRoundedRect(ctx, 5, 5, 300, 35, 5); // Adjust the position, size, and corner radius as needed

    // Draw score
    ctx.font = "24px 'Roboto Slab', serif"; // Update the font size and family
    ctx.fillStyle = "#A6F616"; // Update the text color
    ctx.fillText("Score: " + score, 10, 30);

    // Draw background for level
    ctx.fillStyle = "rgba(25, 25, 25, 0.9)"; // Set the background color with 90% opacity
    drawRoundedRect(ctx, canvas.width - 105, 5, 100, 35, 5); // Adjust the position, size, and corner radius as needed

    // Draw level
    ctx.font = "24px 'Roboto Slab', serif"; // Update the font size and family
    ctx.fillStyle = "#A6F616"; // Update the text color
    ctx.fillText("Level: " + currentLevel, canvas.width - 100, 30);

  } else {
    displayGameOver();
  }

  requestAnimationFrame(draw);
}



function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


function jump() {
  if (frog.y > 0) {
    frog.speed = -6;
  }
}

canvas.addEventListener("click", jump);

function createObstacle() {
  const templateIndex = Math.floor(Math.random() * obstacleTemplates.length);
  const template = obstacleTemplates[templateIndex];

  const obstacle = {
    x: canvas.width,
    y: Math.random() * (canvas.height - template.height - template.gap) + template.gap,
    width: 40,
    height: template.height,
  };
  obstacles.push(obstacle);
}


function createFly() {
  const flyType = Math.random();
  let flyColor;
  let flyPoints;
  let flyImage;

  if (flyType < 0.33) {
    // 33.33% chance for fly type 1 (default yellow)
    flyColor = "yellow";
    flyPoints = 1;
    flyImage = flyImages[0];
  } else if (flyType < 0.66) {
    // 33.33% chance for fly type 2 (green)
    flyColor = "green";
    flyPoints = 5;
    flyImage = flyImages[1];
  } else {
    // 33.33% chance for fly type 3 (purple)
    flyColor = "purple";
    flyPoints = 10;
    flyImage = flyImages[2];
  }

  const fly = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 20),
    width: 90,
    height: 90,
    color: flyColor,
    points: flyPoints,
    image: flyImage,
  };
  flies.push(fly);
}


function spawnMagicSlimePotion() {
  if (Math.random() < 0.0001) {
    createMagicSlimePotion();
  }
}

const magicPotionSpawnInterval = setInterval(() => {
  spawnMagicSlimePotion();
}, 10000); // Adjust this value to control how often the potion spawns.


function createMagicSlimePotion() {
  const magicSlimePotion = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 20),
    width: 100,    // Changed width to create a vertical rectangle
    height: 100,  // Changed height to create a vertical rectangle
    image: magicPotionImg,
  };
  magicSlimePotions.push(magicSlimePotion);
}

function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= gameSpeed * 2;

    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      i--;
      continue;
    }

    const frogCircle = {
      x: frog.x + frog.width / 2,
      y: frog.y + frog.height / 2,
      width: frog.width,
      height: frog.height,
    };

    if (circleRectCollision(frogCircle, obstacles[i])) {
      playSound(obstacleHitSound);
      // Set game over
      gameOver = true;
      return;
    }
  }
}

function circleRectCollision(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const dx = circle.x - cx;
  const dy = circle.y - cy;

  return dx * dx + dy * dy <= (circle.width / 2) * (circle.width / 2);
}

function updateFlies() {
  for (let i = 0; i < flies.length; i++) {
    flies[i].x -= gameSpeed * 1.5;

    if (flies[i].x + flies[i].width < 0) {
      flies.splice(i, 1);
      i--;
      continue;
    }

  if (isColliding(frog, flies[i])) {
      if (flies[i].color === "yellow") {
        playSound(flyCatchSound1);
      } else if (flies[i].color === "green") {
        playSound(flyCatchSound2);
      } else if (flies[i].color === "purple") {
        playSound(flyCatchSound3);
      }

      score += flies[i].points;
      frog.width += flies[i].points * 2;
      frog.height += flies[i].points * 2;
      flies.splice(i, 1);
      i--;

      // Change frog image to frogCatchImg
      if (frogCatchImageLoaded) {
        const previousFrogImg = frogImg.src;
        frogImg.src = frogCatchImg.src;
        setTimeout(() => {
          frogImg.src = previousFrogImg;
        }, 500); // Change back to the previous frog image after 500ms
      }
    }
  }

  for (let i = 0; i < magicSlimePotions.length; i++) {
    magicSlimePotions[i].x -= gameSpeed + 1; // Make them a bit faster than flies

    if (magicSlimePotions[i].x + magicSlimePotions[i].width < 0) {
      magicSlimePotions.splice(i, 1);
      i--;
      continue;
    }

    if (isColliding(frog, magicSlimePotions[i])) {
      playSound(magicPotionCatchSound);
      frog.width = 90;
      frog.height = 90;
      magicSlimePotions.splice(i, 1);
      i--;
    }
  }
}


let level = 1;
//let levelScoreThresholds = [0, 20, 250, 500, 800, 1200]; // use the one about 


function update() {
	
	if (!gameStarted) {
    drawLoadingScreen(ctx);
    return;
  }
	
  frog.speed += frog.gravity;
  frog.y += frog.speed;
  frog.vy = frog.speed;

  if (frog.y >= canvas.height - frog.height) {
    frog.y = canvas.height - frog.height;
    frog.speed = 0;
  }

  if (frog.y <= 0) {
    frog.y = 0;
    frog.speed = 0;
  }

  // Calculate the speed multiplier based on the current level
  const levelMultiplier = 1 + (level - 1) * 2;

  // Update base speeds based on the level
  baseObstacleSpeed = originalBaseObstacleSpeed * levelMultiplier;
  baseFlySpeed = originalBaseFlySpeed * levelMultiplier;
  baseMagicPotionSpeed = originalBaseMagicPotionSpeed * levelMultiplier;

  updateObstacles();
  updateFlies();

  if (frameCount % 100 === 0) {
    createObstacle();
  }

  if (frameCount % 50 === 0) {
    createFly();
  }

  if (frameCount % 600 === 0) { 
    createMagicSlimePotion();
  }

  frameCount++;

  // Check for level completion
  if (isLevelCompleted()) {
    changeLevel();
  }

  // Start the music when the game starts and if it's not already playing
  if (!gameOver && isMusicOn && backgroundMusic.paused) {
    backgroundMusic.play();
  } else if (gameOver || !isMusicOn) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // This resets the music to the start
  }

  if (!gameOver) {
    requestAnimationFrame(update);
  } else {
    displayGameOver();
    return;
  }
}



function displayGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gameContainer = document.getElementById("game-container");

  if (!startOverButtonCreated) {
    const gameOverContainer = document.createElement("div");
    gameOverContainer.classList.add("game-over-container");

    const gameOverText = document.createElement("div");
    gameOverText.classList.add("game-over-text");
    gameOverText.innerHTML = "$MONG - GROW THE STACK<br />Game Over";
    gameOverContainer.appendChild(gameOverText);

    const scoreText = document.createElement("div");
    scoreText.classList.add("score-text");
    scoreText.innerHTML = "games.marginx.io<br />Your Score: " + score;
    gameOverContainer.appendChild(scoreText);

    const startOverButton = document.createElement("button");
    startOverButton.classList.add("start-over-button");
    startOverButton.innerHTML = "Start Over";
    gameOverContainer.appendChild(startOverButton);

    gameContainer.appendChild(gameOverContainer);
    startOverButtonCreated = true;

    startOverButton.addEventListener("click", () => {
      location.reload(); // Reload the page to start over
    });
  }
}



function restartGame() {
  // Remove the "Start Over" button
  const gameContainer = document.getElementById("game-container");
  const startOverButton = gameContainer.querySelector("button");
  if (startOverButton) {
    gameContainer.removeChild(startOverButton);
  }

  // Reset the game variables
  obstacles = [];
  flies = [];
  frameCount = 0;
  score = 0;
  gameSpeed = 2;
  gameOver = false;

  // Reset frog size and position
  frog.width = 90;
  frog.height = 90;
  frog.x = canvas.width / 4;
  frog.y = canvas.height / 2;

  // Reset the startOverButtonCreated flag
  startOverButtonCreated = false;

  // Start the game loop again
  update();
}

draw();
update();
