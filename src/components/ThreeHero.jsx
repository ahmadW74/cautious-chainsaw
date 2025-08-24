import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";

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
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // lights
    const hemi = new THREE.HemisphereLight(0x446688, 0x020205, 0.6);
    scene.add(hemi);
    const rect = new THREE.RectAreaLight(0xffffff, 22, 5, 3);
    rect.position.set(2.8, 1.8, 1.2);
    rect.lookAt(0, 0, 0);
    scene.add(rect);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(-2.0, -1.5, 1.0);
    dir.castShadow = true;
    scene.add(dir);

    const root = new THREE.Group();
    root.name = "HeroRoot";
    root.scale.set(1.18, 1.18, 1.18);
    root.userData.baseRot = 0;
    scene.add(root);

    // helper to create materials
    const material = (color, opts = {}) =>
      new THREE.MeshPhysicalMaterial({
        color,
        clearcoat: 0.65,
        clearcoatRoughness: 0.25,
        roughness: 0.32,
        metalness: 0.25,
        envMapIntensity: 0.55,
        transparent: !!opts.alpha,
        opacity: opts.alpha ?? 1,
        transmission: opts.transmission ?? 0,
        thickness: opts.thickness ?? 0,
      });

    const bgMaterial = (color, opts = {}) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.7,
        metalness: 0.05,
        envMapIntensity: 0.18,
        transparent: !!opts.alpha,
        opacity: opts.alpha ?? 1,
      });

    const layers = [];
    const register = (mesh, depth = 0) => {
      mesh.userData.base = mesh.position.clone();
      mesh.userData.baseRot = mesh.rotation.z;
      mesh.userData.depth = depth;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      layers.push(mesh);
    };

    // huge off-frame oval
    const bgOval1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      bgMaterial(0x1a2a5a, { alpha: 0.8 })
    );
    bgOval1.scale.set(1.9, 1.2, 0.8);
    bgOval1.position.set(2.1, 0.6, -1.3);
    bgOval1.rotation.z = -0.12;
    register(bgOval1, -0.06);

    // tall tilted ellipse (DNS record slab)
    const slab = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 1.6, 4, 16),
      material(0x284c9f)
    );
    slab.scale.set(0.22, 1.7, 0.28);
    slab.rotation.z = -0.33;
    slab.position.set(-1.45, -0.05, 0.2);
    register(slab, 0.16);

    // coin with beveled rim
    const coinGroup = new THREE.Group();
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.08, 48),
      material(0x2f5fb3)
    );
    coinGroup.add(coin);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.02, 16, 64),
      material(0x3c7bdd)
    );
    coinGroup.add(rim);
    coinGroup.position.set(-0.18, -0.02, 0.15);
    register(coinGroup, 0.12);

    // long diagonal blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      material(0x3367bd)
    );
    blade.scale.set(2.5, 0.18, 0.22);
    blade.rotation.z = 0.64;
    blade.position.set(-0.35, 0.12, 0.05);
    register(blade, 0.1);

    // medium ellipse pair
    const ellipsoidFront = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 48, 48),
      material(0x4d89e8, { alpha: 0.65, transmission: 0.05, thickness: 0.4 })
    );
    ellipsoidFront.scale.set(0.95, 0.58, 0.45);
    ellipsoidFront.position.set(0.85, 0.1, 0.15);
    register(ellipsoidFront, 0.14);

    const ellipsoidBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 48, 48),
      material(0x4d89e8, { alpha: 0.45, transmission: 0.05, thickness: 0.4 })
    );
    ellipsoidBack.scale.set(1.25, 0.75, 0.5);
    ellipsoidBack.position.set(0.95, 0.15, 0.05);
    register(ellipsoidBack, 0.08);

    // massive background oval
    const bgOval2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 64, 64),
      bgMaterial(0x112244, { alpha: 0.7 })
    );
    bgOval2.scale.set(2.2, 1.3, 0.9);
    bgOval2.position.set(2.3, -0.15, -1.1);
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
      opacity: 0.3,
      depthWrite: false,
    });
    const readPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      planeMat
    );
    readPlane.position.set(0, -2, 0);
    readPlane.renderOrder = 999;
    register(readPlane, 0);

    // shadow catcher plane
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // postprocessing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const ssaoPass = new SSAOPass(scene, camera, mount.clientWidth, mount.clientHeight);
    ssaoPass.aoClamp = 0.25;
    composer.addPass(ssaoPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.12,
      0.6,
      0.88
    );
    composer.addPass(bloomPass);

    // resize handling
    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      composer.setSize(clientWidth, clientHeight);
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
      cursor.x = THREE.MathUtils.lerp(cursor.x, target.x, 0.1);
      cursor.y = THREE.MathUtils.lerp(cursor.y, target.y, 0.1);

      if (!prefersReducedMotion) {
        root.rotation.y = THREE.MathUtils.lerp(
          root.rotation.y,
          cursor.x * 0.05,
          0.1
        );
        root.rotation.x = THREE.MathUtils.lerp(
          root.rotation.x,
          -cursor.y * 0.04,
          0.1
        );
        root.rotation.z = root.userData.baseRot + Math.sin(t) * 0.02;

        layers.forEach((m, i) => {
          const depth = m.userData.depth || 0;
          const base = m.userData.base;
          const tx = base.x + cursor.x * depth * 0.45;
          const ty = base.y + cursor.y * depth * 0.45;
          m.position.x = THREE.MathUtils.lerp(m.position.x, tx, 0.1);
          m.position.y = THREE.MathUtils.lerp(m.position.y, ty, 0.1);
          m.rotation.z = m.userData.baseRot + Math.sin(t + i) * 0.01;
        });
      }

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

