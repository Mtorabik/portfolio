document.addEventListener('DOMContentLoaded', () => {
  const typewriters = document.querySelectorAll('.typewriter');
  const barcodes = document.querySelectorAll('.barcode');
  typewriters.forEach(el => {
    const delay = parseInt(el.getAttribute('data-delay')) || 0;
    setTimeout(() => {
      el.classList.add('active');
    }, delay);
  });
  barcodes.forEach(el => {
    const delay = parseInt(el.getAttribute('data-delay')) || 0;
    setTimeout(() => {
      el.classList.add('active');
    }, delay);
  });
});

const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

let width, height;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let dots = [];
const numDots = 100;
const maxDist = 150;
const mouseRadius = 100;
const maxConnections = 4;
const repelStrength = 0.5;

class Dot {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() * 2 - 1) * 2;
    this.vy = (Math.random() * 2 - 1) * 2;
    this.value = Math.random() > 0.5 ? '0' : '1';
  }

  update(mouseX, mouseY) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < mouseRadius && d > 0) {
      const force = repelStrength / d;
      this.vx += (dx / d) * force;
      this.vy += (dy / d) * force;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 2) {
        this.vx = (this.vx / speed) * 2;
        this.vy = (this.vy / speed) * 2;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    ctx.font = '16px Fira Code';
    ctx.fillStyle = 'rgba(144, 238, 144, 0.78)';
    ctx.fillText(this.value, this.x, this.y);
  }

  connect(otherDots, mouseX, mouseY) {
    const mouseDist = Math.sqrt((this.x - mouseX) ** 2 + (this.y - mouseY) ** 2);
    if (mouseDist > mouseRadius) {
      let connections = 0;
      const distances = otherDots
        .map(dot => ({
          dot,
          dist: Math.sqrt((this.x - dot.x) ** 2 + (this.y - dot.y) ** 2)
        }))
        .filter(item => item.dist < maxDist)
        .sort((a, b) => a.dist - b.dist);
      for (const { dot } of distances) {
        if (connections >= maxConnections) break;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(dot.x, dot.y);
        ctx.strokeStyle = `rgba(144, 238, 144, ${0.5 - (dot.dist / maxDist) * 0.3})`;
        ctx.stroke();
        connections++;
      }
    }
  }
}

let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, width, height);
  if (dots.length < numDots) {
    dots.push(new Dot());
  }
  dots.forEach(dot => {
    dot.update(mouseX, mouseY);
    dot.connect(dots, mouseX, mouseY);
    dot.draw();
  });
  requestAnimationFrame(animate);
}

animate();