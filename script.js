
        //   THEME COLORS
        const COLORS = [
            '#ff4d9e', '#ff8c00', '#ffd700',
            '#39d353', '#00d4ff', '#b44fff',
            '#ff3333', '#ff6b6b', '#00ffe7',
            '#fb5ffe', '#ffaa00', '#6affb4'
        ];
        let selectedColor = null; // null = random
        //   BACKGROUND PARTICLES
        const bgCanvas = document.getElementById('bgCanvas');
        const bgCtx = bgCanvas.getContext('2d');
        const splashCanvas = document.getElementById('splashCanvas');
        const sCtx = splashCanvas.getContext('2d');
        let bgParticles = [];

        function resizeCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
            splashCanvas.width = window.innerWidth;
            splashCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class BgParticle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * bgCanvas.width;
                this.y = Math.random() * bgCanvas.height;
                this.r = Math.random() * 3 + 1;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.alpha = Math.random() * 0.4 + 0.1;
                this.life = Math.random() * 300 + 100;
                this.age = 0;
            }
            update() {
                this.x += this.vx; this.y += this.vy; this.age++;
                if (this.age > this.life) this.reset();
            }
            draw(ctx) {
                const fade = 1 - this.age / this.life;
                ctx.save();
                ctx.globalAlpha = this.alpha * fade;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < 160; i++) bgParticles.push(new BgParticle());

        function animateBg() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgParticles.forEach(p => { p.update(); p.draw(bgCtx); });
            requestAnimationFrame(animateBg);
        }
        animateBg();
        //   SPLASH PARTICLES (click effect)
        let splashParticles = [];

        class SplashParticle {
            constructor(x, y, color) {
                this.x = x; this.y = y;
                this.color = color;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.r = Math.random() * 6 + 2;
                this.alpha = 1;
                this.gravity = 0.18;
                this.decay = Math.random() * 0.02 + 0.015;
                // random shape: circle or square
                this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
            }
            update() {
                this.x += this.vx; this.vy += this.gravity; this.y += this.vy;
                this.vx *= 0.97;
                this.alpha -= this.decay;
            }
            draw(ctx) {
                if (this.alpha <= 0) return;
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                if (this.shape === 'circle') {
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
                }
                ctx.restore();
            }
            isDead() { return this.alpha <= 0; }
        }

        function animateSplash() {
            sCtx.clearRect(0, 0, splashCanvas.width, splashCanvas.height);
            splashParticles = splashParticles.filter(p => !p.isDead());
            splashParticles.forEach(p => { p.update(); p.draw(sCtx); });
            requestAnimationFrame(animateSplash);
        }
        animateSplash();

        function spawnSplash(x, y, color, count = 60) {
            const c = color || COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < count; i++) {
                splashParticles.push(new SplashParticle(x, y, c));
            }
            // Also spawn a few with neighbouring colors for richness
            const c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < 20; i++) splashParticles.push(new SplashParticle(x, y, c2));

            // Visual burst ring
            const burst = document.createElement('div');
            burst.className = 'color-burst';
            const size = 60;
            burst.style.cssText = `
        left:${x - size / 2}px; top:${y - size / 2}px;
        width:${size}px; height:${size}px;
        background:${c}; opacity:0.5;
        `;
            document.body.appendChild(burst);
            setTimeout(() => burst.remove(), 900);
        }

        // Click / Touch to splash
        document.addEventListener('click', e => {
            if (e.target.classList.contains('palette-dot') || e.target.id === 'celebrateBtn') return;
            spawnSplash(e.clientX, e.clientY, selectedColor);
        });
        document.addEventListener('touchstart', e => {
            const t = e.touches[0];
            spawnSplash(t.clientX, t.clientY, selectedColor);
        }, { passive: true });
        //   PALETTE DOTS – click to pick color
        document.querySelectorAll('.palette-dot').forEach(dot => {
            dot.addEventListener('click', e => {
                e.stopPropagation();
                selectedColor = dot.dataset.color;
                document.querySelectorAll('.palette-dot').forEach(d => d.style.outline = 'none');
                dot.style.outline = '3px solid white';
                spawnSplash(
                    dot.getBoundingClientRect().left + 26,
                    dot.getBoundingClientRect().top + 26,
                    selectedColor, 40
                );
            });
        });
        //   CELEBRATE BUTTON – confetti explosion
        document.getElementById('celebrateBtn').addEventListener('click', () => {
            // Massive multi-point splash
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    spawnSplash(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight * 0.7,
                        COLORS[Math.floor(Math.random() * COLORS.length)],
                        80
                    );
                }, i * 80);
            }
            // Confetti rain
            spawnConfettiRain(120);
        });

        function spawnConfettiRain(count) {
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const el = document.createElement('div');
                    el.className = 'confetti-piece';
                    el.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: -20px;
            background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
            width: ${Math.random() * 8 + 5}px;
            height: ${Math.random() * 8 + 5}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation-duration: ${Math.random() * 2 + 2}s;
            animation-delay: ${Math.random() * 0.5}s;
            opacity: 1;
            `;
                    document.body.appendChild(el);
                    setTimeout(() => el.remove(), 5000);
                }, i * 20);
            }
        }
        //   FLOATING RINGS (background decoration)
        const ringsEl = document.getElementById('rings');
        const ringData = [
            { size: 300, x: 10, y: 20, color: '#ff4d9e', dur: 6 },
            { size: 500, x: 80, y: 70, color: '#ffd700', dur: 9 },
            { size: 200, x: 50, y: 5, color: '#39d353', dur: 7 },
            { size: 400, x: 5, y: 60, color: '#00d4ff', dur: 11 },
            { size: 250, x: 90, y: 30, color: '#b44fff', dur: 8 },
            { size: 350, x: 40, y: 85, color: '#ff8c00', dur: 10 },
        ];
        ringData.forEach(d => {
            const el = document.createElement('div');
            el.className = 'ring';
            el.style.cssText = `
        width:${d.size}px; height:${d.size}px;
        left:${d.x}%; top:${d.y}%;
        border-color:${d.color};
        animation-duration:${d.dur}s;
        animation-delay:${Math.random() * -d.dur}s;
        `;
            ringsEl.appendChild(el);
        });
        //   AUTO CONFETTI on load for festive feel
        window.addEventListener('load', () => {
            setTimeout(() => spawnConfettiRain(60), 800);
            setTimeout(() => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => spawnSplash(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight * 0.5,
                        COLORS[Math.floor(Math.random() * COLORS.length)],
                        50
                    ), i * 200);
                }
            }, 1500);
        });
        //   MOUSE TRAIL (light color trail)
        let trailTimeout;
        document.addEventListener('mousemove', e => {
            clearTimeout(trailTimeout);
            trailTimeout = setTimeout(() => {
                const dot = document.createElement('div');
                const c = COLORS[Math.floor(Math.random() * COLORS.length)];
                const size = Math.random() * 10 + 5;
                dot.style.cssText = `
            position:fixed; border-radius:50%; pointer-events:none; z-index:5;
            left:${e.clientX - size / 2}px; top:${e.clientY - size / 2}px;
            width:${size}px; height:${size}px;
            background:${c}; opacity:0.7;
            transition: opacity 0.6s, transform 0.6s;
            box-shadow: 0 0 ${size}px ${c};
            `;
                document.body.appendChild(dot);
                requestAnimationFrame(() => {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(2)';
                });
                setTimeout(() => dot.remove(), 700);
            }, 10);
        });