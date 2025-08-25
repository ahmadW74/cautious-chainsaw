import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Import small default models so the component works without external URLs
import chainModel from "@/assets/models/chain.obj?url";
import lockModel from "@/assets/models/lock.obj?url";
import keyModel from "@/assets/models/key.obj?url";

export default function GoalsBackground({
  modelUrls = [chainModel, lockModel, keyModel],
  bgColor = "#f8f8f8",
  activeIndex = 0,
  sectionCount = modelUrls.length,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const targetZRef = useRef(0);
  const layerDistance = 12;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    const models = [];

    const randomizeModel = (obj) => {
      const baseRadius = Math.random() * 0.1 + 0.05;
      const scaleMultiplier = obj.userData.scaleMultiplier || 1;
      const radius = baseRadius * scaleMultiplier;
      obj.scale.set(radius, radius, radius);
      obj.userData.rot = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      obj.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 2
      );
    };

    const loader = new OBJLoader();
    const urls =
      modelUrls.length > 0
        ? modelUrls
        : ["/models/model1.obj", "/models/model2.obj", "/models/model3.obj"];

    const loadModels = async () => {
      const templates = await Promise.all(
        urls.map((url) => loader.loadAsync(url))
      );

      templates.forEach((template, i) => {
        const url = urls[i];
        let scaleMultiplier = 1;
        if (url.includes("key")) scaleMultiplier = 0.2;
        else if (url.includes("lock")) scaleMultiplier = 1.5;
        template.userData.scaleMultiplier = scaleMultiplier;
      });

      for (let layer = 0; layer < sectionCount; layer++) {
        const group = new THREE.Group();
        group.position.z = -layer * layerDistance;
        const baseTemplate = templates[layer % templates.length];
        for (let i = 0; i < 10; i++) {
          const template = baseTemplate.clone(true);
          template.userData.scaleMultiplier = baseTemplate.userData.scaleMultiplier;
          template.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(
                  Math.random(),
                  Math.random(),
                  Math.random()
                ),
              });
            }
          });
          randomizeModel(template);
          group.add(template);
          models.push(template);
        }
        scene.add(group);
      }
    };

    loadModels();

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    const animate = () => {
      requestAnimationFrame(animate);
      models.forEach((model) => {
        model.rotation.x += model.userData.rot.x;
        model.rotation.y += model.userData.rot.y;
        model.rotation.z += model.userData.rot.z;
      });
      camera.position.z += (targetZRef.current - camera.position.z) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [modelUrls, sectionCount]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(bgColor);
    }
  }, [bgColor]);

  useEffect(() => {
    targetZRef.current = -activeIndex * layerDistance;
  }, [activeIndex, layerDistance]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
