import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ModelViewer({
  modelUrl,
  autoRotate = true,
  scale = 1,
  initialRotation = { x: 0, y: 0, z: 0 },
  offset = { x: 0, y: 0, z: 0 },
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      modelUrl,
      (gltf) => {
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = maxDim / 2 / Math.tan(fov / 2);
        camera.position.z = cameraZ * 1.2;
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
        model.scale.setScalar(scale);
        model.rotation.set(
          initialRotation.x,
          initialRotation.y,
          initialRotation.z
        );
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error loading model", error);
      }
    );

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      if (autoRotate && model) {
        model.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, [modelUrl, autoRotate, scale, initialRotation, offset]);

  return <div ref={mountRef} className="w-full h-full" />;
}
