'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
}

export function FooterParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number | null = null;
    let isVisible = false;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let ctx: CanvasRenderingContext2D | null = null;

    const initParticles = (w: number, h: number) => {
      const particleCount = Math.min(Math.floor(w / 35), 40);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -Math.random() * 0.4 - 0.1, // Floating gently upward
          radius: Math.random() * 2 + 1.2,
          alpha: Math.random() * 0.5 + 0.25,
          pulseSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    };

    const render = () => {
      if (!isVisible || !ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            const lineAlpha = (1 - dist / 95) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(29, 104, 242, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw each particle with rgb(29, 104, 242) glow
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Pulse alpha
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.7 || p.alpha < 0.2) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        // Wrap around boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `rgba(29, 104, 242, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(29, 104, 242, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(29, 104, 242, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core bright center
        ctx.beginPath();
        ctx.fillStyle = `rgba(100, 160, 255, ${Math.min(1, p.alpha + 0.3)})`;
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Use ResizeObserver to receive layout dimensions asynchronously without forced reflow
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        if (entryWidth > 0 && entryHeight > 0) {
          width = canvas.width = Math.floor(entryWidth);
          height = canvas.height = Math.floor(entryHeight);
          if (particles.length === 0) {
            initParticles(width, height);
          }
        }
      }
    });

    // Use IntersectionObserver to pause rendering and prevent any DOM querying until visible
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          if (!ctx) ctx = canvas.getContext('2d');
          if (animationFrameId === null) {
            animationFrameId = requestAnimationFrame(render);
          }
        } else if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      },
      { rootMargin: '100px' }
    );

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    intersectionObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
