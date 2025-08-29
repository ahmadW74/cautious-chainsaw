import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import earthModel from "@/assets/models/Earth 2K.obj?url";
import earthMaterial from "@/assets/models/Earth 2K.mtl?url";
import diffuseTexture from "@/assets/models/Textures/Diffuse_2K.png?url";
import bumpTexture from "@/assets/models/Textures/Bump_2K.png?url";

export default function GlobeScene({
  modelUrl = earthModel,
  mtlUrl = earthMaterial,
  onSetRotation,
  distance = 1,
}) {
  const mountRef = useRef(null);
  const globeRef = useRef();
  const rotationRef = useRef({ x: 0, y: 0 });
  const dotIntervalRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // brighter, balanced lighting to remove dark spots
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    // Initial camera position; updated after model load for size-based framing
    camera.position.set(5, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor("#000000", 0);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = true;

    const textureLoader = new THREE.TextureLoader();
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    const gltfLoader = new GLTFLoader();
    const dots = [];
    const DOT_COUNT = 20;
    const domains = [
      "domain1.com",
      "domain2.com",
      "domain3.com",
      "domain4.com",
      "domain5.com",
    ];

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

    const addDots = (radius, count = 1) => {
      for (let i = 0; i < count; i++) {
        const position = randomPointOnSphere(radius * 1.02);

        const geometry = new THREE.SphereGeometry(radius * 0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
        });
        const dot = new THREE.Mesh(geometry, material);
        dot.scale.setScalar(0);
        dot.position.copy(position);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        dot.userData.tooltip = domain;
        globeRef.current.add(dot);

        // invisible larger sphere for easier hover detection
        const hoverGeometry = new THREE.SphereGeometry(radius * 0.05, 8, 8);
        const hoverMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        });
        const hoverDot = new THREE.Mesh(hoverGeometry, hoverMaterial);
        hoverDot.position.copy(position);
        hoverDot.userData.tooltip = domain;
        globeRef.current.add(hoverDot);
        dots.push(hoverDot);

        gsap.to(dot.material, { opacity: 1, duration: 0.6 });
        gsap.to(dot.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.6,
          ease: "back.out(2)",
        });

        gsap.to(dot.material, {
          opacity: 0,
          duration: 0.6,
          delay: 5,
          onComplete: () => {
            globeRef.current.remove(dot);
            globeRef.current.remove(hoverDot);
            dots.splice(dots.indexOf(hoverDot), 1);
            geometry.dispose();
            material.dispose();
            hoverGeometry.dispose();
            hoverMaterial.dispose();
          },
        });
        gsap.to(dot.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.6,
          delay: 5,
        });
      }
    };

    const finishModel = (obj) => {
      const scale = 1.5;
      obj.scale.setScalar(scale);
      globeRef.current = obj;
      scene.add(globeRef.current);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const radius = Math.max(size.x, size.y, size.z) / 2;
      addDots(radius, DOT_COUNT);
      const camX = radius * 3.3 * distance;
      const camZ = radius * 2 * distance;
      camera.position.set(camX, 0, camZ);
      camera.lookAt(0, 0, 0);
      controls.update();
      dotIntervalRef.current = setInterval(() => addDots(radius), 1000);
    };

    const loadObjModel = () => {
      mtlLoader.load(mtlUrl, (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(modelUrl, async (obj) => {
          const [diffuseMap, bumpMap] = await Promise.all([
            textureLoader.loadAsync(diffuseTexture),
            textureLoader.loadAsync(bumpTexture),
          ]);

          // Create fresh material to avoid reinitializing textures
          const earthMat = new THREE.MeshPhongMaterial({
            map: diffuseMap,
            bumpMap: bumpMap,
            bumpScale: 0.005,
          });

          obj.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            // Dispose of placeholder material and assign new one with loaded textures
            if (child.material.name === "Earth") {
              child.material.dispose();
              child.material = earthMat;
            } else if (child.material.name === "Clouds") {
              // Remove clouds mesh to avoid using additional textures
              child.parent.remove(child);
            }
          });

          finishModel(obj);
        });
      });
    };

    const loadGlbModel = () => {
      gltfLoader.load(modelUrl, (gltf) => {
        finishModel(gltf.scene);
      });
    };

    const ext = modelUrl.split(".").pop().toLowerCase();
    if (ext === "glb" || ext === "gltf") {
      loadGlbModel();
    } else {
      loadObjModel();
    }

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

    // OrbitControls handle user interaction

    const onHover = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(dots);
      if (intersects.length > 0) {
        tooltip.textContent = intersects[0].object.userData.tooltip;
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
        rotationRef.current.y += 0.0005; // idle spin slowed down
        globeRef.current.rotation.x = rotationRef.current.x;
        globeRef.current.rotation.y = rotationRef.current.y;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      mount.removeEventListener("pointermove", onHover);
      mount.removeChild(tooltip);
      if (dotIntervalRef.current) clearInterval(dotIntervalRef.current);
      renderer.dispose();
    };
  }, [modelUrl, mtlUrl, onSetRotation, distance]);

  return <div ref={mountRef} className="w-full h-full" />;
}
