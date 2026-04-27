import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  canvas: HTMLCanvasElement | null;
};

const GpuRipple = ({ canvas }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!canvas) return;
    if (!mountRef.current) return;
    if (initialized.current) return;

    initialized.current = true;

    const el = mountRef.current;

    const width = 500;
    const height = 400;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main(){
          vec2 uv = vUv;

          float d = distance(uv, uMouse);

          if(d < 0.2){
            vec2 dir = normalize(uv - uMouse);
            uv += dir * 0.05;
          }

          gl_FragColor = texture2D(uTexture, uv);
        }
      `,
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      material
    );
    scene.add(mesh);

    const mouse = new THREE.Vector2();

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();

      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1 - (e.clientY - rect.top) / rect.height;

      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    };

    window.addEventListener("mousemove", onMove);

    const animate = () => {
      requestAnimationFrame(animate);
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [canvas]); // ← これ重要

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-10"
    />
  );
};

export default GpuRipple;