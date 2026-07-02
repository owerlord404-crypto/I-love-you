(function() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    const textElement = document.getElementById('loveText');

    const W = 600, H = 600;
    canvas.width = W;
    canvas.height = H;

    // Yurak parametrik tenglamalari
    function heartX(t, scale = 14) {
        return 16 * Math.pow(Math.sin(t), 3) * scale;
    }
    function heartY(t, scale = 14) {
        return -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
    }

    // Yurak nuqtalarini generatsiya qilish
    function generateHeartPoints() {
        const points = [];
        const scales = [14, 13.2, 12.5, 11.8, 11.0, 10.2, 9.4, 8.6, 7.8, 7.0];
        const pointsPerLayer = 280;
        
        scales.forEach((s, idx) => {
            const count = pointsPerLayer + (idx === 0 ? 200 : 0);
            const offset = idx * 0.5;
            for (let i = 0; i < count; i++) {
                const t = (i / count) * 2 * Math.PI + offset * 0.1;
                let x = heartX(t, s);
                let y = heartY(t, s);
                const jitter = 0.7 + Math.random() * 0.8;
                x += (Math.random() - 0.5) * jitter * 1.8;
                y += (Math.random() - 0.5) * jitter * 1.8;
                const cx = 300 + x;
                const cy = 300 + y;
                if (cx > 10 && cx < W-10 && cy > 10 && cy < H-10) {
                    points.push({ x: cx, y: cy });
                }
            }
        });

        // Qo'shimcha tashqi qavat
        for (let i = 0; i < 500; i++) {
            const t = (i / 500) * 2 * Math.PI;
            let x = heartX(t, 14.6);
            let y = heartY(t, 14.6);
            x += (Math.random() - 0.5) * 1.2;
            y += (Math.random() - 0.5) * 1.2;
            const cx = 300 + x;
            const cy = 300 + y;
            if (cx > 10 && cx < W-10 && cy > 10 && cy < H-10) {
                points.push({ x: cx, y: cy });
            }
        }
        return points;
    }

    const heartTargets = generateHeartPoints();
    const totalParticles = heartTargets.length;
    console.log(`Yurak nuqtalari: ${totalParticles}`);

    // Ranglar palitrasi
    const colors = [
        '#ff4d6d', '#ff6b8a', '#ff8aa8', '#ffa5b9', '#ffb3c6',
        '#ff1a4f', '#e6004d', '#ff3366', '#ff6699', '#ff99bb',
        '#ffb3b3', '#ffcccc', '#ffd6e0'
    ];

    // Boshlang'ich holat: mayda bolaklar butun ekranga tarqalgan
    const particles = [];
    for (let i = 0; i < totalParticles; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 50 + Math.random() * 200;
        const x = W/2 + Math.cos(angle) * radius;
        const y = H/2 + Math.sin(angle) * radius;
        const target = heartTargets[i];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2.0 + Math.random() * 3.5;
        const phase = Math.random() * 2 * Math.PI;
        const speed = 0.3 + Math.random() * 0.6;
        
        particles.push({
            x: x,
            y: y,
            targetX: target.x,
            targetY: target.y,
            size: size,
            color: color,
            phase: phase,
            speed: speed,
            amp: 0.3 + Math.random() * 0.8,
            // Juda tez yig'ilish uchun lerpSpeed ni ancha oshiramiz
            lerpSpeed: 0.035 + Math.random() * 0.065
        });
    }

    let time = 0;
    let animationFrame;
    let isAssembled = false;
    let assemblyProgress = 0;

    // Matnni ko'rsatish
    function showText() {
        textElement.classList.add('show');
    }

    function drawParticles() {
        ctx.clearRect(0, 0, W, H);

        let allSettled = true;
        
        for (let p of particles) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > 0.2) {
                // Juda tez yig'ilish uchun speed ni ancha oshiramiz
                const speed = p.lerpSpeed * (1 + assemblyProgress * 5);
                p.x += dx * speed;
                p.y += dy * speed;
                allSettled = false;
            } else {
                p.x = p.targetX;
                p.y = p.targetY;
            }

            // Mayda tebranish
            const offsetX = Math.sin(time * p.speed + p.phase) * p.amp * 0.3;
            const offsetY = Math.cos(time * p.speed * 0.8 + p.phase * 1.2) * p.amp * 0.3;
            const drawX = p.x + offsetX;
            const drawY = p.y + offsetY;

            const sizeVar = 1 + 0.15 * Math.sin(time * p.speed * 0.6 + p.phase);
            const currentSize = p.size * sizeVar;

            ctx.beginPath();
            ctx.arc(drawX, drawY, currentSize * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(drawX, drawY, currentSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff9f0';
            ctx.globalAlpha = 0.25;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // SH+S harflarini yurakning o'rtasiga chizish
        if (assemblyProgress > 0.2) {
            const alpha = Math.min(1, (assemblyProgress - 0.2) / 0.3);
            ctx.save();
            ctx.globalAlpha = alpha;
            
            const centerX = W / 2;
            const centerY = H / 2 + 5;
            
            // Yorqin porlash
            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 80);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
            ctx.fill();
            
            // SH+S matni
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = '#ff4d6d';
            ctx.shadowBlur = 40;
            ctx.font = 'bold 52px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('SH+S', centerX, centerY);
            
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffd6e0';
            ctx.fillText('SH+S', centerX, centerY);
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 50px Arial, sans-serif';
            ctx.fillText('SH+S', centerX, centerY - 1);
            
            ctx.strokeStyle = '#ff4d6d';
            ctx.lineWidth = 2;
            ctx.font = 'bold 52px Arial, sans-serif';
            ctx.strokeText('SH+S', centerX, centerY);
            
            ctx.restore();
        }

        // Yig'ilish progressini juda tez oshirish
        if (!isAssembled) {
            assemblyProgress = Math.min(1, assemblyProgress + 0.025);
            if (assemblyProgress >= 1) {
                isAssembled = true;
                setTimeout(showText, 200);
            }
        }

        time += 0.025;
        animationFrame = requestAnimationFrame(drawParticles);
    }

    function startAnimation() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        time = 0;
        assemblyProgress = 0;
        isAssembled = false;
        textElement.classList.remove('show');
        drawParticles();
    }

    startAnimation();

    // Canvasni ekran o'lchamiga moslash
    function resizeCanvas() {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.8;
        const ratio = Math.min(1, maxWidth / W, maxHeight / H);
        canvas.style.width = (W * ratio) + 'px';
        canvas.style.height = (H * ratio) + 'px';
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('beforeunload', function() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
    });

})();