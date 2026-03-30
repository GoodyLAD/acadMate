'use client';
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface PixelBlastProps {
  variant?: 'circle' | 'square' | 'diamond';
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  className?: string;
}

export const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'circle',
  pixelSize = 6,
  color = '#B19EEF',
  patternScale = 3,
  patternDensity = 1.2,
  pixelSizeJitter = 0.5,
  enableRipples = true,
  rippleSpeed = 0.4,
  rippleThickness = 0.12,
  rippleIntensityScale = 1.5,
  liquid = true,
  liquidStrength = 0.12,
  liquidRadius = 1.2,
  liquidWobbleSpeed = 5,
  speed = 0.6,
  edgeFade = 0.25,
  transparent = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparent,
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create pixel geometry
    const createPixelGeometry = () => {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];

      const colorObj = new THREE.Color(color);
      const gridSize = Math.floor(Math.sqrt(patternDensity * 1000));

      for (let i = 0; i < gridSize * gridSize; i++) {
        const x = (i % gridSize) - gridSize / 2;
        const y = Math.floor(i / gridSize) - gridSize / 2;

        positions.push(x * patternScale, y * patternScale, 0);

        // Color variation
        const hue =
          (colorObj.getHSL({ h: 0, s: 0, l: 0 }).h + Math.random() * 0.1) % 1;
        const newColor = new THREE.Color().setHSL(hue, 0.8, 0.6);
        colors.push(newColor.r, newColor.g, newColor.b);

        // Size variation
        const size = pixelSize * (1 + (Math.random() - 0.5) * pixelSizeJitter);
        sizes.push(size);
      }

      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      return geometry;
    };

    // Create material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        liquidStrength: { value: liquidStrength },
        liquidRadius: { value: liquidRadius },
        liquidWobbleSpeed: { value: liquidWobbleSpeed },
        rippleSpeed: { value: rippleSpeed },
        rippleThickness: { value: rippleThickness },
        rippleIntensityScale: { value: rippleIntensityScale },
        edgeFade: { value: edgeFade },
        enableRipples: { value: enableRipples ? 1.0 : 0.0 },
        liquid: { value: liquid ? 1.0 : 0.0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float liquidStrength;
        uniform float liquidRadius;
        uniform float liquidWobbleSpeed;
        uniform float rippleSpeed;
        uniform float rippleThickness;
        uniform float rippleIntensityScale;
        uniform float edgeFade;
        uniform float enableRipples;
        uniform float liquid;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Liquid effect
          if (liquid > 0.5) {
            float distance = length(pos.xy);
            float wobble = sin(distance * liquidWobbleSpeed + time) * liquidStrength;
            pos.z += wobble * exp(-distance / liquidRadius);
          }
          
          // Ripple effect
          if (enableRipples > 0.5) {
            float ripple = sin(length(pos.xy) * rippleSpeed - time * 10.0) * rippleThickness;
            pos.z += ripple * rippleIntensityScale;
          }
          
          // Edge fade
          float dist = length(pos.xy);
          float fade = 1.0 - smoothstep(0.0, edgeFade * 10.0, dist);
          pos.z += fade * 0.5;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -pos.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create pixel shape based on variant
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          float alpha = 1.0;
          if (dist > 0.5) {
            alpha = 0.0;
          }
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: transparent,
      blending: THREE.AdditiveBlending,
    });

    // Create mesh
    const geometry = createPixelGeometry();
    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (material.uniforms.time) {
        material.uniforms.time.value += speed * 0.01;
      }

      // Rotate the entire scene for dynamic effect
      mesh.rotation.z += speed * 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [
    variant,
    pixelSize,
    color,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquid,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    speed,
    edgeFade,
    transparent,
  ]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full ${className}`}
      style={{ position: 'relative' }}
    />
  );
};
