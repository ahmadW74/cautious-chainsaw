import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Import small default models so the component works without external URLs
import chainModel from "@/assets/models/chain.obj?url";
import lockModel from "@/assets/models/lock.obj?url";
import keyModel from "@/assets/models/key.obj?url";

export default function GoalsBackground({
  modelUrls = [chainModel, lockModel, keyModel],
}) {
  const mountRef = useRef(null);

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
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0); // transparent background
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    const models = [];
    const count = Math.floor(Math.random() * 6) + 6; // 6-11 models

    const randomizeModel = (obj, offscreen = true) => {
      const baseRadius = Math.random() * 0.1 + 0.05; // smaller model size
      const scaleMultiplier = obj.userData.scaleMultiplier || 1;
      const radius = baseRadius * scaleMultiplier;
      obj.scale.set(radius, radius, radius);
      obj.userData.radius = radius;
      obj.userData.rot = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );

      // give the model a random color each time it is (re)generated
      obj.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.setHex(Math.random() * 0xffffff);
        }
      });

      // position the model, optionally off screen to avoid popping into view
      const pos = new THREE.Vector3();
      let tries = 0;
      const randomY = () =>
        offscreen
          ? Math.random() > 0.5
            ? 6 + Math.random() * 4
            : -6 - Math.random() * 4
          : (Math.random() - 0.5) * 6;
      do {
        pos.set(
          (Math.random() - 0.5) * 10,
          randomY(),
          (Math.random() - 0.5) * 4
        );
        tries++;
      } while (
        tries < 20 &&
        models.some(
          (m) =>
            m !== obj &&
            pos.distanceTo(m.position) < radius + m.userData.radius + 0.1
        )
      );
      obj.position.copy(pos);
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
        if (url.includes("key")) scaleMultiplier = 0.2; // further shrink key
        else if (url.includes("lock")) scaleMultiplier = 2; // enlarge lock
        template.userData.scaleMultiplier = scaleMultiplier;
      });

      for (let i = 0; i < count; i++) {
        const baseTemplate =
          templates[Math.floor(Math.random() * templates.length)];
        const template = baseTemplate.clone(true);
        template.userData.scaleMultiplier = baseTemplate.userData.scaleMultiplier;
        // initially place some models within view so background is visible
        randomizeModel(template, false);
        scene.add(template);
        models.push(template);
      }
    };

    loadModels();

    let speed = 0;
    const onWheel = (e) => {
      speed += e.deltaY * 0.002; // scroll up -> move down
    };
    window.addEventListener("wheel", onWheel);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    const animate = () => {
      requestAnimationFrame(animate);
      speed *= 0.95;
      models.forEach((model) => {
        model.position.y += speed;
        if (model.position.y > 5 || model.position.y < -5) {
          randomizeModel(model);
        }
        model.rotation.x += model.userData.rot.x;
        model.rotation.y += model.userData.rot.y;
        model.rotation.z += model.userData.rot.z;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [modelUrls]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
}
