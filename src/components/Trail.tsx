import { useEffect, useRef } from "react";

type Props = {
  trailRef: React.MutableRefObject<{ x: number; y: number }[]>;
};

const Trail = ({ trailRef }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailRef.current.forEach((p, i) => {
        const alpha = i / trailRef.current.length;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 10 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-50"
    />
  );
};

export default Trail;