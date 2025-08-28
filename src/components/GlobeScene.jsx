import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import earthModel from "@/assets/models/Earth 2K.obj?url";
import earthMaterial from "@/assets/models/Earth 2K.mtl?url";
import diffuseTexture from "@/assets/models/Textures/Diffuse_2K.png?url";
import bumpTexture from "@/assets/models/Textures/Bump_2K.png?url";
import cloudsTexture from "@/assets/models/Textures/Clouds_2K.png?url";

export default function GlobeScene({
  modelUrl = earthModel,
  mtlUrl = earthMaterial,
  onSetRotation,
}) {
  const mountRef = useRef(null);
  const globeRef = useRef();
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // basic lighting so the globe isn't rendered black
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    // Offset camera so about 60% of the globe is visible
    // and ensure it starts outside the globe's radius
    camera.position.set(10, 0, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor("#000000", 0);
    mount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    const dots = [];

    const randomPointOnSphere = (radius) => {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    };

    const addDots = (radius, count = 20) => {
      const geometry = new THREE.SphereGeometry(radius * 0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let i = 0; i < count; i++) {
        const dot = new THREE.Mesh(geometry, material);
        dot.position.copy(randomPointOnSphere(radius));
        dot.userData.value = Math.floor(Math.random() * 1000);
        // Attach dots to the globe so they rotate together
        globeRef.current.add(dot);
        dots.push(dot);
      }
    };

    mtlLoader.load(mtlUrl, (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(modelUrl, async (obj) => {
        const [diffuseMap, bumpMap, cloudsMap] = await Promise.all([
          textureLoader.loadAsync(diffuseTexture),
          textureLoader.loadAsync(bumpTexture),
          textureLoader.loadAsync(cloudsTexture),
        ]);

        obj.traverse((child) => {
          if (child.isMesh && child.material) {
            const name = child.material.name;
            if (name === "Earth") {
              child.material.map = diffuseMap;
              child.material.bumpMap = bumpMap;
              child.material.bumpScale = 0.005;
            } else if (name === "Clouds") {
              child.material.map = cloudsMap;
              child.material.transparent = true;
              child.material.opacity = 0.8;
              child.material.depthWrite = false;
            }
            child.material.needsUpdate = true;
          }
        });

        // Increase the overall scale of the globe
        const scale = 1.5;
        obj.scale.setScalar(scale);
        globeRef.current = obj;
        scene.add(globeRef.current);
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z) / 2;
        addDots(radius);
      });
    });

    mount.style.position = "relative";

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.pointerEvents = "none";
    tooltip.style.background = "rgba(0, 0, 0, 0.7)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "4px 8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.display = "none";
    mount.appendChild(tooltip);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    const setRotation = ({
      x = rotationRef.current.x,
      y = rotationRef.current.y,
    }) => {
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
    const onPointerMoveDrag = (e) => {
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
    window.addEventListener("pointermove", onPointerMoveDrag);
    window.addEventListener("pointerup", onPointerUp);

    const onHover = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(dots);
      if (intersects.length > 0) {
        tooltip.textContent = intersects[0].object.userData.value;
        tooltip.style.display = "block";
        tooltip.style.left = `${e.clientX - rect.left + 8}px`;
        tooltip.style.top = `${e.clientY - rect.top + 8}px`;
      } else {
        tooltip.style.display = "none";
      }
    };
    mount.addEventListener("pointermove", onHover);

    let paused = false;
    const visibility = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", visibility);

    const animate = () => {
      requestAnimationFrame(animate);
      if (paused) return;
      if (globeRef.current) {
        rotationRef.current.y += 0.001; // idle spin
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
      window.removeEventListener("pointermove", onPointerMoveDrag);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointermove", onHover);
      mount.removeChild(tooltip);
      renderer.dispose();
    };
  }, [modelUrl, mtlUrl, onSetRotation]);

  return <div ref={mountRef} className="w-full h-full" />;
}
