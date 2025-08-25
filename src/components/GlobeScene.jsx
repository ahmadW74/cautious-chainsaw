import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import globeModel from "@/assets/models/globe.obj?url";

export default function GlobeScene({
  modelUrl = globeModel,
  onSetRotation,
  clipOppositeHemisphere = true,
}) {
  const mountRef = useRef(null);
  const globeRef = useRef();
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      25,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    // Sit near the globe's side so only a slim slice is shown
    camera.position.set(2, 0, 0.5);
    camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      // Use an opaque black background to avoid showing the page's white default
      renderer.setClearColor("#000000", 1);
    if (clipOppositeHemisphere) {
      renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)];
      renderer.localClippingEnabled = true;
    }
    mount.appendChild(renderer.domElement);

    const loader = new OBJLoader();
    loader.load(modelUrl, (obj) => {
      globeRef.current = obj;
      globeRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
      });
      scene.add(globeRef.current);
    });

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    const setRotation = ({ x = rotationRef.current.x, y = rotationRef.current.y }) => {
      rotationRef.current.x = x;
      rotationRef.current.y = y;
    };
    if (onSetRotation) onSetRotation(setRotation);

    // optional drag to rotate
    const dragging = { active: false, x: 0, y: 0 };
    const onPointerDown = (e) => {
      dragging.active = true;
      dragging.x = e.clientX;
      dragging.y = e.clientY;
    };
    const onPointerMove = (e) => {
      if (!dragging.active) return;
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      dragging.x = e.clientX;
      dragging.y = e.clientY;
    };
    const onPointerUp = () => (dragging.active = false);
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    let paused = false;
    const visibility = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", visibility);

    const animate = () => {
      requestAnimationFrame(animate);
      if (paused) return;
      if (globeRef.current) {
        rotationRef.current.y = Math.min(
          Math.PI / 2,
          rotationRef.current.y + 0.001
        ); // idle spin without exposing the far side
        globeRef.current.rotation.x = rotationRef.current.x;
        globeRef.current.rotation.y = rotationRef.current.y;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [modelUrl, onSetRotation, clipOppositeHemisphere]);

  return <div ref={mountRef} className="w-full h-full" />;
}

