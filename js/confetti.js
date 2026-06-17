// ============================================
// confetti.js — Lightweight Confetti Animation
// رحلة مصطفى — Mostafa's Journey
// ============================================

const Confetti = (() => {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationId = null;

  const COLORS = ['#D97706', '#F59E0B', '#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#EC4899', '#F97316'];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = -Math.random() * 14 - 6;
      this.gravity = 0.4;
      this.drag = 0.98;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.width = Math.random() * 10 + 5;
      this.height = Math.random() * 6 + 3;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.opacity = 1;
      this.fadeRate = 0.008 + Math.random() * 0.008;
    }

    update() {
      this.vy += this.gravity;
      this.vx *= this.drag;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fadeRate;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }

    isDead() {
      return this.opacity <= 0;
    }
  }

  function ensureCanvas() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
      `;
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => !p.isDead());

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Burst confetti from a point
  function burst(x, y, count = 60) {
    ensureCanvas();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y));
    }
    if (!animationId) {
      animate();
    }
  }

  // Full screen celebration
  function celebrate(count = 120) {
    ensureCanvas();
    const cx = canvas.width / 2;
    const sources = [
      { x: cx, y: canvas.height * 0.4 },
      { x: cx - 100, y: canvas.height * 0.5 },
      { x: cx + 100, y: canvas.height * 0.5 },
    ];
    sources.forEach(src => {
      for (let i = 0; i < count / sources.length; i++) {
        particles.push(new Particle(src.x, src.y));
      }
    });
    if (!animationId) {
      animate();
    }
  }

  // Rain confetti from top
  function rain(duration = 3000) {
    ensureCanvas();
    const interval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        const p = new Particle(Math.random() * canvas.width, -10);
        p.vy = Math.random() * 3 + 1;
        p.vx = (Math.random() - 0.5) * 3;
        particles.push(p);
      }
    }, 50);

    setTimeout(() => clearInterval(interval), duration);

    if (!animationId) {
      animate();
    }
  }

  return { burst, celebrate, rain };
})();
