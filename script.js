const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const grid=20;
let snake=[{x:10,y:10}];
let dir={x:1,y:0};
let food={x:15,y:15};
let gameInterval;
let isPaused = false;

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let s of snake){
    ctx.fillStyle="#2ecc71"; // Green
    ctx.fillRect(s.x*grid, s.y*grid, grid-2, grid-2);
  }
  ctx.fillStyle="#e74c3c"; // Red
  ctx.fillRect(food.x*grid, food.y*grid, grid-2, grid-2);
}

function update(){
  let nx=snake[0].x+dir.x, ny=snake[0].y+dir.y;
  if(nx<0||ny<0||nx>=canvas.width/grid||ny>=canvas.height/grid||snake.some(p=>p.x===nx&&p.y===ny)){
    clearInterval(gameInterval);
    alert("Game Over! Refresh to play again.");
    return;
  }
  snake.unshift({x:nx,y:ny});
  if(nx===food.x&&ny===food.y){
    food={x:Math.floor(Math.random()*canvas.width/grid),y:Math.floor(Math.random()*canvas.height/grid)};
  } else snake.pop();
  draw();
}

function togglePause() {
  if (isPaused) {
    gameInterval = setInterval(update, 120);
    isPaused = false;
  } else {
    clearInterval(gameInterval);
    isPaused = true;
  }
}

window.addEventListener("keydown",e=>{
  if(e.key=="ArrowRight" && dir.x !== -1) dir={x:1,y:0};
  else if(e.key=="ArrowLeft" && dir.x !== 1) dir={x:-1,y:0};
  else if(e.key=="ArrowUp" && dir.y !== 1) dir={x:0,y:-1};
  else if(e.key=="ArrowDown" && dir.y !== -1) dir={x:0,y:1};
  else if(e.key.toLowerCase()=="p"){
    togglePause();
  }
});

function start(){
  draw();
  gameInterval=setInterval(update,120);
}

window.onload=start;
