import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    const layers = [];
    const addLayer = (mesh, depth) => {
      mesh.position.z = depth;
      scene.add(mesh);
      layers.push({
        mesh,
        depth,
        base: mesh.position.clone(),
        drift: Math.random() * Math.PI * 2,
      });
    };

    const ellipse = (radius, color, opacity) => {
      const geo = new THREE.CircleGeometry(radius, 64);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      return new THREE.Mesh(geo, mat);
    };

    // Huge off-frame ellipse (top-right vignette)
    const vignette = ellipse(1, 0x001f3f, 0.25);
    vignette.scale.set(3.5, 2.2, 1);
    vignette.position.set(2.2, 1.5, 0);
    addLayer(vignette, -0.04);

    // Tall, thin, tilted ellipse (left foreground)
    const slab = ellipse(0.5, 0x4b0082, 0.7);
    slab.scale.set(0.2, 3.5, 1);
    slab.rotation.z = -0.4;
    slab.position.set(-2, 0.2, 0.18);
    const slabEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CircleGeometry(0.5, 64)),
      new THREE.LineBasicMaterial({
        color: 0x00ced1,
        transparent: true,
        opacity: 0.7,
      })
    );
    slabEdge.scale.copy(slab.scale);
    slab.add(slabEdge);
    addLayer(slab, 0.18);

    // Coin-disc with beveled edge (left-mid)
    const coinGroup = new THREE.Group();
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
      new THREE.MeshStandardMaterial({
        color: 0x4b0082,
        transparent: true,
        opacity: 0.85,
      })
    );
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.02, 16, 100),
      new THREE.MeshStandardMaterial({
        color: 0x00ced1,
        transparent: true,
        opacity: 0.85,
      })
    );
    rim.rotation.x = Math.PI / 2;
    coinGroup.add(coin);
    coinGroup.add(rim);
    coinGroup.position.set(-1, -0.5, 0.15);
    addLayer(coinGroup, 0.15);

    // Long diagonal blade ellipse crossing center-left
    const blade = ellipse(1, 0x4b0082, 0.65);
    blade.scale.set(3.5, 0.4, 1);
    blade.rotation.z = 0.6;
    blade.position.set(-0.5, 0.5, 0.1);
    const bladeEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CircleGeometry(1, 64)),
      new THREE.LineBasicMaterial({
        color: 0x00ced1,
        transparent: true,
        opacity: 0.65,
      })
    );
    bladeEdge.scale.copy(blade.scale);
    blade.add(bladeEdge);
    addLayer(blade, 0.1);

    // Medium ellipse pair (center-right)
    const mid1 = ellipse(0.6, 0x4169e1, 0.75);
    mid1.scale.set(1.5, 1, 1);
    mid1.position.set(1, 0.2, 0.06);
    addLayer(mid1, 0.06);

    const mid2 = ellipse(0.6, 0x00ced1, 0.4);
    mid2.scale.set(1.5, 1, 1);
    mid2.position.set(1.2, 0.3, 0.05);
    addLayer(mid2, 0.05);

    // Massive background oval (right)
    const bgOval = ellipse(1.5, 0x4169e1, 0.15);
    bgOval.scale.set(2.5, 3, 1);
    bgOval.position.set(2.5, 0.3, 0);
    addLayer(bgOval, -0.02);

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    let pointer = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width - 0.5;
      target.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      if (!reduceMotion) {
        pointer.x += (target.x - pointer.x) * 0.05;
        pointer.y += (target.y - pointer.y) * 0.05;
        const t = clock.getElapsedTime();
        layers.forEach((layer) => {
          const range = 0.1 + ((layer.depth + 0.05) / 0.25) * 0.3; // 0.1 - 0.4
          const idleX = Math.sin(t + layer.drift) * range * 0.02;
          const idleY = Math.cos(t + layer.drift) * range * 0.02;
          const tx = layer.base.x + pointer.x * range + idleX;
          const ty = layer.base.y - pointer.y * range + idleY;
          layer.mesh.position.x += (tx - layer.mesh.position.x) * 0.1;
          layer.mesh.position.y += (ty - layer.mesh.position.y) * 0.1;
          const rotTarget = pointer.x * 0.05;
          layer.mesh.rotation.z += (rotTarget - layer.mesh.rotation.z) * 0.1;
        });
        frameId = requestAnimationFrame(animate);
      }
      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

