// /js/view-manager.js
import { toRad } from './utils.js';
import gsap from 'gsap';

export class ViewManager {
  constructor(cameraController, views) {
    this.cam = cameraController;
    this.views = views;
  }

  goToView(name) {
    if (!this.views[name]) return;
    const view = this.views[name];
    const { position, rotation } = view;

    const start = {
      px: this.cam.yawRig.position.x,
      py: this.cam.yawRig.position.y,
      pz: this.cam.yawRig.position.z,
      ry: this.cam.yawRig.rotation.y,
      rx: this.cam.pitchRig.rotation.x
    };

    const target = {
      px: position[0],
      py: position[1],
      pz: position[2],
      ry: toRad(rotation[1]),
      rx: toRad(rotation[0])
    };

    gsap.to(start, {
      px: target.px,
      py: target.py,
      pz: target.pz,
      ry: target.ry,
      rx: target.rx,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.cam.yawRig.position.set(start.px, start.py, start.pz);
        this.cam.yawRig.rotation.y = start.ry;
        this.cam.pitchRig.rotation.x = start.rx;
      },
      onComplete: () => {
        this.cam.input.yaw = start.ry;
        this.cam.input.pitch = start.rx;
      }
    });
  }
}
