import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

type DarkVeilProps = {
  className?: string;
};

const vertex = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

// Simple hash noise
float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(in vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main(){
  vec2 uv = vUv;
  // Subtle vignette
  float vignette = smoothstep(1.2, 0.4, distance(uv, vec2(0.5)));
  // Flowing noise layers
  float t = uTime * 0.05;
  float n1 = noise(uv * 4.0 + vec2(t, -t));
  float n2 = noise(uv * 2.0 + vec2(-t * 0.7, t * 0.9));
  float veil = mix(n1, n2, 0.5);
  // Color blend (indigo/purple/teal)
  vec3 c1 = vec3(0.10, 0.15, 0.40);
  vec3 c2 = vec3(0.28, 0.10, 0.45);
  vec3 c3 = vec3(0.08, 0.32, 0.34);
  vec3 col = mix(c1, c2, veil);
  col = mix(col, c3, smoothstep(0.3, 0.8, veil));
  // Boost saturation subtly and apply vignette
  col *= 0.9 + 0.3 * vignette;
  gl_FragColor = vec4(col, 1.0);
}`;

const DarkVeil: React.FC<DarkVeilProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 1; // unused for fullscreen quad, but required

    const scene = new Transform();

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value = [clientWidth, clientHeight];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const update = () => {
      const t = (performance.now() - start) / 1000;
      program.uniforms.uTime.value = t;
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    cleanupRef.current = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      try {
        container.removeChild(gl.canvas);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* ignore */
      }
    };

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
};

export default DarkVeil;
