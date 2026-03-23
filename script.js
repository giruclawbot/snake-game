const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayTitle = overlay.querySelector('h2');
const overlayMsg = overlay.querySelectorAll('p');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');

// Responsive canvas size
function getCanvasSize() {
  const max = Math.min(window.innerWidth - 32, 400);
  return Math.floor(max / 20) * 20; // must be multiple of grid
}

const GRID = 20;
let size = getCanvasSize();
canvas.width = size;
canvas.height = size;
const CELLS = size / GRID;

let snake, dir, nextDir, food, score, best, gameInterval, isPaused, running;

function init() {
  snake = [{ x: Math.floor(CELLS / 2), y: Math.floor(CELLS / 2) }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  isPaused = false;
  running = false;
  best = parseInt(localStorage.getItem('snake-best') || '0');
  bestEl.textContent = best;
  scoreEl.textContent = 0;
  pauseBtn.textContent = '⏸ Pausar';
  spawnFood();
  draw();
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid dots (subtle)
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < CELLS; x++) {
    for (let y = 0; y < CELLS; y++) {
      ctx.fillRect(x * GRID + GRID / 2 - 1, y * GRID + GRID / 2 - 1, 2, 2);
    }
  }

  // Food (pulsing red circle)
  const cx = food.x * GRID + GRID / 2;
  const cy = food.y * GRID + GRID / 2;
  const r = GRID / 2 - 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.shadowColor = '#e74c3c';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const ratio = 1 - i / snake.length;
    const g = Math.floor(180 + ratio * 76); // gradient from head to tail
    ctx.fillStyle = isHead ? '#2ecc71' : `rgb(0, ${g}, 80)`;
    const pad = isHead ? 1 : 2;
    const radius = isHead ? 5 : 3;
    roundRect(ctx, seg.x * GRID + pad, seg.y * GRID + pad, GRID - pad * 2, GRID - pad * 2, radius);
    ctx.fill();
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function update() {
  dir = { ...nextDir };
  const nx = snake[0].x + dir.x;
  const ny = snake[0].y + dir.y;

  // Wall or self collision → game over
  if (nx < 0 || ny < 0 || nx >= CELLS || ny >= CELLS || snake.some(p => p.x === nx && p.y === ny)) {
    gameOver();
    return;
  }

  snake.unshift({ x: nx, y: ny });

  if (nx === food.x && ny === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem('snake-best', best);
    }
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  clearInterval(gameInterval);
  running = false;
  overlayTitle.textContent = score > 0 ? `💀 Game Over` : '💀 Game Over';
  overlayMsg.forEach(p => { p.style.display = 'none'; });
  startBtn.textContent = '🔄 Reintentar';

  // Show score in overlay
  let existingScore = overlay.querySelector('.overlay-score');
  if (!existingScore) {
    existingScore = document.createElement('p');
    existingScore.className = 'overlay-score';
    existingScore.style.cssText = 'color:#f7c548;font-size:1.1em;';
    overlay.insertBefore(existingScore, startBtn);
  }
  existingScore.textContent = `Puntuación: ${score}${score >= best && score > 0 ? ' 🏆 ¡Nuevo récord!' : ''}`;
  overlay.style.display = 'flex';
}

function startGame() {
  // Resize if window size changed
  const newSize = getCanvasSize();
  if (newSize !== size) {
    size = newSize;
    canvas.width = size;
    canvas.height = size;
  }

  clearInterval(gameInterval);
  overlay.style.display = 'none';
  overlayMsg.forEach(p => { p.style.display = ''; });

  const existingScore = overlay.querySelector('.overlay-score');
  if (existingScore) existingScore.remove();

  init();
  running = true;
  isPaused = false;
  gameInterval = setInterval(update, 110);
}

function togglePause() {
  if (!running) return;
  if (isPaused) {
    gameInterval = setInterval(update, 110);
    isPaused = false;
    pauseBtn.textContent = '⏸ Pausar';
    overlay.style.display = 'none';
  } else {
    clearInterval(gameInterval);
    isPaused = true;
    pauseBtn.textContent = '▶ Continuar';
    overlayTitle.textContent = '⏸ Pausado';
    overlayMsg.forEach(p => { p.style.display = 'none'; });
    startBtn.textContent = '▶ Continuar';
    overlay.style.display = 'flex';
  }
}

// Keyboard
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowRight': if (dir.x !== -1) nextDir = { x: 1, y: 0 }; break;
    case 'ArrowLeft':  if (dir.x !== 1)  nextDir = { x: -1, y: 0 }; break;
    case 'ArrowUp':    if (dir.y !== 1)  nextDir = { x: 0, y: -1 }; break;
    case 'ArrowDown':  if (dir.y !== -1) nextDir = { x: 0, y: 1 };  break;
    case 'p': case 'P': togglePause(); break;
  }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
});

// D-pad buttons
document.getElementById('btn-up').addEventListener('click',    () => { if (dir.y !== 1)  nextDir = { x: 0, y: -1 }; });
document.getElementById('btn-down').addEventListener('click',  () => { if (dir.y !== -1) nextDir = { x: 0, y: 1 }; });
document.getElementById('btn-left').addEventListener('click',  () => { if (dir.x !== 1)  nextDir = { x: -1, y: 0 }; });
document.getElementById('btn-right').addEventListener('click', () => { if (dir.x !== -1) nextDir = { x: 1, y: 0 }; });

// Touch swipe on canvas
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
    else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
  } else {
    if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
    else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
  }
  e.preventDefault();
}, { passive: false });

startBtn.addEventListener('click', () => {
  if (isPaused) togglePause();
  else startGame();
});

pauseBtn.addEventListener('click', togglePause);

// Init on load
init();
