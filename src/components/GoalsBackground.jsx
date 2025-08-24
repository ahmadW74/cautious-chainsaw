import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GoalsBackground() {
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0xf8f8f8); // offwhite background
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    const balls = [];
    const count = Math.floor(Math.random() * 10) + 10; // 10-19 balls

    // Base geometries reused for all balls
    const topGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const bottomGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);

    const randomizeBall = (group, yPos) => {
      const radius = Math.random() * 0.3 + 0.2;
      group.scale.set(radius, radius, radius);
      group.userData.radius = radius;
      group.userData.rot = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );

      group.children[0].material.color.set(Math.random() * 0xffffff);
      group.children[1].material.color.set(Math.random() * 0xffffff);

      const pos = new THREE.Vector3();
      let tries = 0;
      do {
        pos.set(
          (Math.random() - 0.5) * 10,
          yPos !== undefined ? yPos : (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 4
        );
        tries++;
      } while (
        tries < 20 &&
        balls.some(
          (b) => b !== group && pos.distanceTo(b.position) < radius + b.userData.radius + 0.1
        )
      );
      group.position.copy(pos);
    };

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(topGeo, new THREE.MeshStandardMaterial()));
      group.add(new THREE.Mesh(bottomGeo, new THREE.MeshStandardMaterial()));
      randomizeBall(group);
      scene.add(group);
      balls.push(group);
    }

    let speed = 0;
    const onWheel = (e) => {
      speed += -e.deltaY * 0.002; // scroll up -> move up
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
      balls.forEach((ball) => {
        ball.position.y += speed;
        if (ball.position.y > 5) {
          randomizeBall(ball, -5);
        }
        if (ball.position.y < -5) {
          randomizeBall(ball, 5);
        }
        ball.rotation.x += ball.userData.rot.x;
        ball.rotation.y += ball.userData.rot.y;
        ball.rotation.z += ball.userData.rot.z;
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
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

