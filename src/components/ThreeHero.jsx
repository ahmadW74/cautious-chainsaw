import { useEffect, useRef } from "react";
import * as THREE from "three";

// 3D hero background matching DNSSEC blue spec
export default function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    // lights
    const hemi = new THREE.HemisphereLight(0x446688, 0x020205, 0.6);
    scene.add(hemi);
    const rect = new THREE.RectAreaLight(0xffffff, 2, 4, 4);
    rect.position.set(3, 2, 5);
    rect.lookAt(0, 0, 0);
    scene.add(rect);

    const root = new THREE.Group();
    root.name = "HeroRoot";
    scene.add(root);

    // helper to create materials
    const material = (color, opts = {}) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.3,
        metalness: 0.25,
        envMapIntensity: 0.35,
        transparent: !!opts.alpha,
        opacity: opts.alpha ?? 1,
      });

    const layers = [];
    const register = (mesh, depth = 0) => {
      mesh.userData.base = mesh.position.clone();
      mesh.userData.depth = depth;
      root.add(mesh);
      layers.push(mesh);
    };

    // huge off-frame oval
    const bgOval1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      material(0x1a2a5a, { alpha: 0.8 })
    );
    bgOval1.scale.set(1.8, 1.2, 0.8);
    bgOval1.position.set(3, 2, -0.5);
    register(bgOval1, -0.06);

    // tall tilted ellipse (DNS record slab)
    const slab = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 1.6, 4, 16),
      material(0x284c9f)
    );
    slab.rotation.z = -0.35;
    slab.position.set(-1.4, 0.2, 0.2);
    register(slab, 0.16);

    // coin with beveled rim
    const coinGroup = new THREE.Group();
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.08, 48),
      material(0x2f5fb3)
    );
    coinGroup.add(coin);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.02, 16, 64),
      material(0x3c7bdd)
    );
    coinGroup.add(rim);
    coinGroup.position.set(-0.6, -0.4, 0);
    register(coinGroup, 0.12);

    // long diagonal blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      material(0x3367bd)
    );
    blade.rotation.z = 0.65;
    blade.scale.set(2.4, 0.18, 0.22);
    blade.position.set(-0.2, 0, 0);
    register(blade, 0.1);

    // medium ellipse pair
    const ellipsoid1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 48, 48),
      material(0x4d89e8, { alpha: 0.65 })
    );
    ellipsoid1.scale.set(1.2, 0.7, 1);
    ellipsoid1.position.set(1.2, 0.2, 0.1);
    register(ellipsoid1, 0.08);

    const ellipsoid2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 48, 48),
      material(0x4d89e8, { alpha: 0.45 })
    );
    ellipsoid2.scale.set(1.0, 0.6, 0.9);
    ellipsoid2.position.set(1.35, 0.25, 0.02);
    register(ellipsoid2, 0.14);

    // massive background oval
    const bgOval2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 64, 64),
      material(0x112244, { alpha: 0.7 })
    );
    bgOval2.scale.set(2.4, 1.6, 1);
    bgOval2.position.set(2.2, -0.1, -1.2);
    register(bgOval2, -0.02);

    // subtle trust arc + tick
    const trustSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      material(0x00e5ff)
    );
    trustSphere.position.set(-0.2, 0.7, 0.1);
    register(trustSphere, 0.2);

    const checkCanvas = document.createElement("canvas");
    checkCanvas.width = 64;
    checkCanvas.height = 64;
    const ctx = checkCanvas.getContext("2d");
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.lineTo(28, 44);
    ctx.lineTo(46, 20);
    ctx.stroke();
    const checkTex = new THREE.CanvasTexture(checkCanvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: checkTex, opacity: 0.85, transparent: true })
    );
    sprite.scale.set(0.25, 0.25, 1);
    sprite.position.set(-0.2, 0.7, 0.11);
    register(sprite, 0.2);

    // readability plane under text
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const readPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      planeMat
    );
    readPlane.position.set(0, -2, 0);
    readPlane.renderOrder = 999;
    register(readPlane, 0);

    // resize handling
    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // pointer interaction
    const cursor = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    window.addEventListener("pointermove", handlePointerMove);

    let start = performance.now();
    const animate = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      // smooth cursor
      cursor.x += (target.x - cursor.x) * 0.1;
      cursor.y += (target.y - cursor.y) * 0.1;

      if (!prefersReducedMotion) {
        root.rotation.y = cursor.x * 0.2;
        root.rotation.x = -cursor.y * 0.15;
        root.position.x = cursor.x * 0.1;
        root.position.y = cursor.y * 0.05;
        root.rotation.z = Math.sin(t * 0.2) * 0.02;
      }

      layers.forEach((m, i) => {
        const depth = m.userData.depth || 0;
        const base = m.userData.base;
        const tx = base.x + cursor.x * depth;
        const ty = base.y + cursor.y * depth;
        m.position.x += (tx - m.position.x) * 0.1;
        m.position.y += (ty - m.position.y) * 0.1;
        if (!prefersReducedMotion) {
          m.rotation.z += Math.sin(t * 1.5 + i) * 0.0005;
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

