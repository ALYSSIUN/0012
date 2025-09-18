// /js/scene-manager.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SceneManager {
  constructor(containerId) {
    // 1. Grab the container <div>
    this.container = document.getElementById(containerId) || document.body;

    // 2. Create a THREE.Scene and set background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 3. Create a PerspectiveCamera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // 4. Create the WebGLRenderer and append it
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // 4b. Prevent default contextmenu on right-click
    this.renderer.domElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // 5. Track time for animation
    this.lastTime = 0;

    // 6. Basic lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    // 7. Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  async loadModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          // Center, rotate, scale as original
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.rotation.y = Math.PI / -1.15;
          model.scale.set(1.2, 1.2, 1.2);

          this.scene.add(model);
          resolve(model);
        },
        undefined,
        (err) => {
          console.error('Error loading model:', err);
          reject(err);
        }
      );
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(delta) {
    this.renderer.render(this.scene, this.camera);
  }
}
