import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Geometry } from 'ogl';

type GalaxyProps = {
  className?: string;
  mouseRepulsion?: boolean;
  mouseInteraction?: boolean;
  density?: number; // 1.0 is default, >1 adds more points
  glowIntensity?: number; // 0..1
  saturation?: number; // 0..1
  hueShift?: number; // degrees 0..360
};

const vert = /* glsl */ `
attribute vec2 position;
attribute float aAngle;
attribute float aRadius;
attribute float aSeed;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uRepel;
varying float vSeed;
varying float vDist;

void main(){
  // Polar to cartesian base position with slow rotation
  float angle = aAngle + uTime * 0.05;
  float r = aRadius;
  vec2 p = vec2(cos(angle), sin(angle)) * r;

  // Subtle spiral twist
  p += 0.02 * vec2(cos(3.0*angle + aSeed*6.2831), sin(2.0*angle + aSeed*3.1415));

  // Mouse interaction in screen space (uv 0..1)
  vec2 uv = (p * 0.5 + 0.5);
  vec2 mp = uMouse / uRes; // 0..1
  vec2 dir = normalize(uv - mp + 1e-5);
  float d = distance(uv, mp);
  float influence = uMouseActive * smoothstep(0.35, 0.0, d);
  // repel=1 => push away, 0 => attract
  float s = mix(-1.0, 1.0, uRepel);
  uv += s * dir * 0.08 * influence;

  vDist = d;
  vSeed = aSeed;
  vec2 clip = uv * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = 1.5 + 1.5 * (1.0 - d) * influence;
}`;

const frag = /* glsl */ `
precision highp float;
uniform float uGlow;
uniform float uSat;
uniform float uHue;
varying float vSeed;
varying float vDist;

vec3 hsl2rgb(vec3 hsl){
  vec3 rgb = clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
  return hsl.z + hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
}

void main(){
  // radial falloff for point sprite
  vec2 pc = gl_PointCoord * 2.0 - 1.0;
  float m = 1.0 - dot(pc, pc);
  if (m <= 0.0) discard;
  float glow = pow(m, mix(2.0, 4.0, uGlow));

  float baseHue = (uHue/360.0) + vSeed*0.15;
  vec3 col = hsl2rgb(vec3(fract(baseHue), clamp(uSat, 0.0, 1.0), 0.6));
  col += glow * 0.4;
  gl_FragColor = vec4(col, glow);
}
`;

const Galaxy: React.FC<GalaxyProps> = ({
  className,
  mouseRepulsion = true,
  mouseInteraction = true,
  density = 1.0,
  glowIntensity = 0.5,
  saturation = 0.8,
  hueShift = 240,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    const scene = new Transform();

    const countBase = Math.floor(2000 * Math.max(0.25, density));
    const angles = new Float32Array(countBase);
    const radii = new Float32Array(countBase);
    const seeds = new Float32Array(countBase);
    const positions = new Float32Array(countBase * 2);
    for (let i = 0; i < countBase; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = Math.sqrt(Math.random()) * 0.9; // denser center
      seeds[i] = Math.random();
      positions[i * 2] = 0;
      positions[i * 2 + 1] = 0; // not used in vertex, but required
    }

    const geometry = new Geometry(gl, {
      position: { size: 2, data: positions },
      aAngle: { size: 1, data: angles },
      aRadius: { size: 1, data: radii },
      aSeed: { size: 1, data: seeds },
    });

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [-9999, -9999] },
        uMouseActive: { value: 0 },
        uRepel: { value: mouseRepulsion ? 1 : 0 },
        uGlow: { value: Math.max(0, Math.min(1, glowIntensity)) },
        uSat: { value: Math.max(0, Math.min(1, saturation)) },
        uHue: { value: hueShift },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const points = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    points.setParent(scene);

    const resize = () => {
      const w = Math.max(1, el.parentElement?.clientWidth ?? el.clientWidth);
      const h = Math.max(1, el.parentElement?.clientHeight ?? el.clientHeight);
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w, h];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el.parentElement || el);
    resize();

    let raf = 0;
    const start = performance.now();
    const update = () => {
      program.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    const eventTarget: HTMLElement | Window = el.parentElement || window;
    const onMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = (el.parentElement || el).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      program.uniforms.uMouse.value = [x, y];
      program.uniforms.uMouseActive.value = 1;
    };
    const onLeave = () => {
      program.uniforms.uMouseActive.value = 0;
      program.uniforms.uMouse.value = [-9999, -9999];
    };
    (eventTarget as any).addEventListener('mousemove', onMove);
    (eventTarget as any).addEventListener('mouseleave', onLeave);

    cleanupRef.current = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      (eventTarget as any).removeEventListener('mousemove', onMove);
      (eventTarget as any).removeEventListener('mouseleave', onLeave);
      try {
        el.removeChild(gl.canvas);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* ignore */
      }
    };

    return () => cleanupRef.current?.();
  }, [
    mouseRepulsion,
    mouseInteraction,
    density,
    glowIntensity,
    saturation,
    hueShift,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
};

export default Galaxy;
