// /js/ui-manager.js
//
// Handles:
//  1. Camera‐Speed slider inside Data Panel
//  2. Toggling Data Panel on all screen sizes
//  3. Toggling the hamburger menu on small screens
//  4. Logo click → Home view
//  5. Updating System Info each frame
//

import * as THREE from 'three';

export class UIManager {
  constructor(cameraController, viewManager) {
    this.cameraController = cameraController;
    this.viewManager = viewManager;

    // 1. CAMERA SPEED SLIDER INSIDE DATA PANEL
    this.speedSlider = document.getElementById('cam-speed-slider');
    this.speedValueElem = document.getElementById('cam-speed-value');

    // Initialize slider value
    this.speedSlider.value = this.cameraController.input.speed.toFixed(2);
    this.speedValueElem.textContent = this.cameraController.input.speed.toFixed(2);

    // Update on input
    this.speedSlider.addEventListener('input', () => {
      const val = parseFloat(this.speedSlider.value);
      this.cameraController.input.speed = val;
      this.speedValueElem.textContent = val.toFixed(2);
    });

    // 2. CACHE DATA PANEL ELEMENTS
    this.dataPanel = document.getElementById('data-panel');
    this.fpsValueElem    = document.getElementById('fps-value');
    this.camLocationElem = document.getElementById('cam-location');
    this.camRotationElem = document.getElementById('cam-rotation');

    // 3. DATA PANEL TOGGLE (All screen sizes)
    this.dataToggleBtn = document.getElementById('data-toggle-button');
    this.dataToggleBtn.addEventListener('click', () => {
      this.dataPanel.classList.toggle('hidden');
    });

    // 4. HAMBURGER MENU (Mobile)
    this.hamburger = document.getElementById('hamburger');
    this.navLinksContainer = document.querySelector('.navbar-links');
    this.hamburger.addEventListener('click', () => {
      this.navLinksContainer.classList.toggle('open');
    });

    // 5. NAV BUTTONS (Desktop & Mobile)
    document.getElementById('btn-home').addEventListener('click', () => {
      this.viewManager.goToView('home');
      if (this.navLinksContainer.classList.contains('open')) {
        this.navLinksContainer.classList.remove('open');
      }
    });
    document.getElementById('btn-explore').addEventListener('click', () => {
      this.viewManager.goToView('explore');
      if (this.navLinksContainer.classList.contains('open')) {
        this.navLinksContainer.classList.remove('open');
      }
    });
    document.getElementById('btn-about').addEventListener('click', () => {
      this.viewManager.goToView('about');
      if (this.navLinksContainer.classList.contains('open')) {
        this.navLinksContainer.classList.remove('open');
      }
    });
    document.getElementById('btn-contact').addEventListener('click', () => {
      this.viewManager.goToView('contact');
      if (this.navLinksContainer.classList.contains('open')) {
        this.navLinksContainer.classList.remove('open');
      }
    });

    // 6. LOGO CLICK → GO TO HOME VIEW
    const logoElem = document.getElementById('logo');
    if (logoElem) {
      logoElem.addEventListener('click', () => {
        this.viewManager.goToView('home');
        if (this.navLinksContainer.classList.contains('open')) {
          this.navLinksContainer.classList.remove('open');
        }
      });
    }
  }

  /**
   * Called each frame by index.js
   * @param {number} delta – seconds elapsed since last frame
   * @param {CameraController} cameraController – to read pos/rot
   */
  update(delta, cameraController) {
    // FPS:
    const fps = delta > 0 ? (1 / delta).toFixed(1) : '0.0';
    this.fpsValueElem.textContent = fps;

    // Camera Location:
    const pos = cameraController.yawRig.position;
    this.camLocationElem.textContent =
      `${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`;

    // Camera Rotation (pitch, yaw):
    const yawDeg   = THREE.MathUtils.radToDeg(cameraController.yawRig.rotation.y);
    const pitchDeg = THREE.MathUtils.radToDeg(cameraController.pitchRig.rotation.x);
    this.camRotationElem.textContent = `${pitchDeg.toFixed(2)}, ${yawDeg.toFixed(2)}`;

    // (Camera speed is updated by the slider’s "input" event.)
  }
}
