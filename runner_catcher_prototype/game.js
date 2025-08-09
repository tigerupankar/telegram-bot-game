
// Simple endless runner with creature spawning and tap-to-catch
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const caughtElem = document.getElementById('caught');

let W = canvas.width, H = canvas.height;
let scale = 1;
function resize() {
  const ratio = W / H;
  const maxW = Math.min(window.innerWidth - 20, 900);
  const newW = maxW;
  const newH = Math.round(newW / ratio);
  canvas.style.width = newW + 'px';
  canvas.style.height = newH + 'px';
}
window.addEventListener('resize', resize);
resize();

// Game state
let lanes = [W*0.25, W*0.5, W*0.75];
let player = {lane:1, x: lanes[1], y: H - 120, width: 46, height: 80, vy:0, onGround:true, color:'#ffdd55'};
let obstacles = [];
let creatures = [];
let lastSpawn = 0;
let spawnInterval = 1400; // ms
let lastTime = performance.now();
let distance = 0;
let score = 0;
let caught = 0;
let speed = 180; // pixels per second (background movement)
let running = true;

// Input
document.getElementById('leftBtn').addEventListener('click', ()=>{ moveLeft(); });
document.getElementById('rightBtn').addEventListener('click', ()=>{ moveRight(); });
document.getElementById('jumpBtn').addEventListener('click', ()=>{ jump(); });
canvas.addEventListener('touchstart', handleTouch, {passive:false});
canvas.addEventListener('mousedown', handleTouch);

function handleTouch(e){
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  // convert to canvas coords (approx)
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = x * scaleX;
  const cy = y * scaleY;
  // Check creatures first (tap-to-catch)
  for (let i=0;i<creatures.length;i++){
    const c = creatures[i];
    if (cx >= c.x - c.size/2 && cx <= c.x + c.size/2 && cy >= c.y - c.size/2 && cy <= c.y + c.size/2){
      // attempt catch
      if (Math.random() < 0.75) { // 75% catch chance basic
        caught += 1;
        score += 80;
        creatures.splice(i,1);
        updateHUD();
        return;
      } else {
        // failed catch: small penalty
        score = Math.max(0, score-10);
        updateHUD();
        return;
      }
    }
  }

  // Otherwise jump
  jump();
}

function moveLeft(){ player.lane = Math.max(0, player.lane-1); }
function moveRight(){ player.lane = Math.min(2, player.lane+1); }
function jump(){ if (player.onGround){ player.vy = -10; player.onGround = false; } }

function updateHUD(){
  scoreElem.textContent = 'Score: ' + Math.floor(score);
  caughtElem.textContent = 'Caught: ' + caught;
}

// Spawn creatures and obstacles
function spawnCreature(){
  const laneIndex = Math.floor(Math.random()*3);
  const x = lanes[laneIndex];
  const y = H - 180 - Math.random()*80;
  const c = {x, y, lane: laneIndex, size: 44 + Math.random()*30, type: 'creature'};
  creatures.push(c);
}
function spawnObstacle(){
  const laneIndex = Math.floor(Math.random()*3);
  const x = lanes[laneIndex];
  const ob = {x, y: H - 110, lane: laneIndex, width: 60, height: 40, color:'#552'};
  obstacles.push(ob);
}

function gameLoop(t){
  const dt = Math.min(40, t - lastTime);
  lastTime = t;
  if (!running) return;

  // update distance & score
  distance += (speed * dt/1000);
  score += (speed * dt/1000) * 0.02;

  // gravity
  player.vy += 0.6;
  player.y += player.vy;
  if (player.y >= H - 120){ player.y = H - 120; player.vy = 0; player.onGround = true; }

  // lerp to lane x
  const targetX = lanes[player.lane];
  player.x += (targetX - player.x) * 0.25;

  // spawn logic
  lastSpawn += dt;
  if (lastSpawn > spawnInterval){
    lastSpawn = 0;
    if (Math.random() < 0.6) spawnCreature();
    if (Math.random() < 0.4) spawnObstacle();
    // slowly increase speed
    speed += 3;
  }

  // update creatures (they move left to simulate scenery)
  for (let i=creatures.length-1;i>=0;i--){
    const c = creatures[i];
    c.y += Math.sin((t + i*100)/300)*0.2; // small bob
    // collision with player (if in same lane and close)
    const dx = Math.abs(player.x - c.x);
    const dy = Math.abs(player.y - c.y);
    if (dx < 50 && dy < 60){
      // collision -> auto-trigger catch chance
      if (Math.random() < 0.6){
        caught += 1;
        score += 100;
      } else {
        score = Math.max(0, score - 5);
      }
      creatures.splice(i,1);
      updateHUD();
    }
  }

  // obstacles collision
  for (let i=obstacles.length-1;i>=0;i--){
    const o = obstacles[i];
    if (o.lane === player.lane && Math.abs(player.y - o.y) < 50 && player.onGround){
      // hit obstacle -> slow down & score penalty
      speed = Math.max(120, speed - 30);
      score = Math.max(0, score - 30);
      obstacles.splice(i,1);
      updateHUD();
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // ground
  ctx.fillStyle = '#3a6'; ctx.fillRect(0, H - 100, W, 100);

  // road lanes (visual)
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i=0;i<3;i++){
    ctx.fillRect(lanes[i]-80, H-140, 160, 60);
  }

  // draw player (simple styled character)
  ctx.save();
  ctx.translate(player.x, player.y);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(0, player.height/2 + 8, 28, 10, 0,0,Math.PI*2); ctx.fill();
  // body
  ctx.fillStyle = player.color;
  roundRect(ctx, -player.width/2, -player.height, player.width, player.height, 8, true, false);
  // face
  ctx.fillStyle = '#fff'; ctx.fillRect(-12, -player.height+10, 24, 20);
  ctx.fillStyle = '#000'; ctx.fillRect(-6, -player.height+16, 4, 4);
  ctx.fillRect(2, -player.height+16, 4, 4);
  ctx.restore();

  // draw creatures
  for (const c of creatures){
    ctx.save();
    ctx.translate(c.x, c.y);
    // body
    ctx.beginPath();
    ctx.fillStyle = '#ff88cc';
    ctx.ellipse(0,0, c.size/2, c.size/2, 0,0,Math.PI*2); ctx.fill();
    // eyes
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-c.size*0.12, -c.size*0.12, c.size*0.12, c.size*0.12, 0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.size*0.12, -c.size*0.12, c.size*0.12, c.size*0.12, 0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-6, -6, 3, 3); ctx.fillRect(4, -6, 3, 3);
    ctx.restore();
  }

  // draw obstacles
  for (const o of obstacles){
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.fillStyle = o.color;
    roundRect(ctx, -o.width/2, -o.height, o.width, o.height, 6, true, false);
    ctx.restore();
  }
}

// helper roundRect
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (r === undefined) r = 5;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Start game
updateHUD();
requestAnimationFrame(gameLoop);

// Simple keyboard controls for desktop testing
window.addEventListener('keydown', (e)=>{
  if (e.key === 'ArrowLeft') moveLeft();
  if (e.key === 'ArrowRight') moveRight();
  if (e.key === ' ') jump();
});

// End-game submission (example): call submitScore() to send result to bot/server
function submitScoreToServer(){
  // Try to use Telegram WebApp if present
  const payload = { score: Math.floor(score), caught };
  if (window.Telegram && window.Telegram.WebApp){
    try {
      // send as a message to bot via answerWebAppQuery would be server side; here we post to our server endpoint
      fetch('/session/score', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ initData: window.tgInitData, payload }) })
        .then(()=>{ alert('Score submitted!'); });
    } catch (e){ console.log('submit failed', e); }
  } else {
    alert('Score: ' + Math.floor(score) + '\\nCaught: ' + caught);
  }
}

// simple UI: long-press to submit
canvas.addEventListener('dblclick', submitScoreToServer);
