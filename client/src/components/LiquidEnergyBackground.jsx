import { useEffect, useRef } from 'react';

const LiquidEnergyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const numWaves = 5;
      for (let i = 0; i < numWaves; i++) {
        const alpha = 0.04 + i * 0.015;
        const hue = 115 + i * 8;
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${alpha})`;
        ctx.lineWidth = 2;

        const freq = 0.003 + i * 0.001;
        const amp = 40 + i * 20 + (mouse.y / canvas.height) * 30;
        const speed = t * (0.3 + i * 0.1);
        const mouseInfluence = (mouse.x / canvas.width - 0.5) * 60;

        for (let x = 0; x <= canvas.width; x += 3) {
          const y =
            canvas.height / 2 +
            Math.sin(x * freq + speed) * amp +
            Math.sin(x * freq * 0.5 + speed * 0.7 + i) * (amp * 0.5) +
            mouseInfluence * Math.sin(x * 0.005 + t * 0.2);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw subtle particles
      for (let p = 0; p < 12; p++) {
        const px = (Math.sin(t * 0.4 + p * 1.3) * 0.5 + 0.5) * canvas.width;
        const py = (Math.cos(t * 0.3 + p * 0.9) * 0.5 + 0.5) * canvas.height;
        const radius = 1.5 + Math.sin(t + p) * 1;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57, 255, 20, 0.25)`;
        ctx.fill();
      }

      t += 0.02;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-energy-canvas"
      aria-hidden="true"
    />
  );
};

export default LiquidEnergyBackground;
