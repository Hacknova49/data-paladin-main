import React, { useEffect, useRef } from 'react';

interface PixelBlastProps {
  className?: string;
}

export const PixelBlast: React.FC<PixelBlastProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = this.getRandomColor();
        this.opacity = Math.random() * 0.5 + 0.2;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
      }

      getRandomColor(): string {
        const colors = [
          'hsl(220, 70%, 50%)',
          'hsl(160, 60%, 45%)',
          'hsl(30, 80%, 55%)',
          'hsl(280, 65%, 60%)',
          'hsl(340, 75%, 55%)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        // Fade out over time
        this.opacity = Math.max(0, 1 - (this.life / this.maxLife));

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Reset particle when it dies
        if (this.life >= this.maxLife) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.life = 0;
          this.opacity = Math.random() * 0.5 + 0.2;
          this.color = this.getRandomColor();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Draw pixel as small square
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        
        ctx.restore();
      }
    }

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resizeCanvas();
      particles.length = 0;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 100) * 0.1;
            ctx.strokeStyle = 'hsl(220, 70%, 50%)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};