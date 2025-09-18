// /js/index.js

import * as THREE from 'three';
import { SceneManager }   from './scene-manager.js';
import { CameraController } from './camera-controller.js';
import { UIManager }       from './ui-manager.js';
import { ViewManager }     from './view-manager.js';
import { VIEWS }           from './constants.js';
import { toRad }           from './utils.js';

(async function init() {
  // 1. Setup SceneManager and load the GLB model
  const sceneMgr = new SceneManager('canvas-container');
  await sceneMgr.loadModel('assets/models/scene.glb');

  // 2. Setup CameraController (pass in renderer.domElement so mouse/touch events are bound correctly)
  const camCtrl = new CameraController(
    sceneMgr.scene,
    sceneMgr.camera,
    sceneMgr.renderer.domElement
  );

  // 3. Setup ViewManager (it uses GSAP under the hood for smooth tweening)
  const viewMgr = new ViewManager(camCtrl, VIEWS);

  // 4. Immediately place the camera at the “Start Point” (no tween)
  {
    const startView = VIEWS['Start Point'];
    if (startView) {
      const [ x, y, z ]        = startView.position;
      const [ rotXdeg, rotYdeg ] = startView.rotation;

      // set yawRig.position
      camCtrl.yawRig.position.set(x, y, z);

      // convert degrees → radians for pitch (x‐axis) and yaw (y‐axis)
      camCtrl.yawRig.rotation.y   = toRad(rotYdeg);
      camCtrl.pitchRig.rotation.x = toRad(rotXdeg);

      // keep input.yaw / input.pitch in sync so user can immediately take control
      camCtrl.input.yaw   = camCtrl.yawRig.rotation.y;
      camCtrl.input.pitch = camCtrl.pitchRig.rotation.x;
    }
  }

  // 5. After a 1-second delay, smoothly tween the camera to the “home” view
  setTimeout(() => {
    viewMgr.goToView('home');
  }, 100);

  // 6. Finally, hook up the UI (menus, buttons, etc.) which will call viewMgr.goToView(...) as needed
  const uiMgr = new UIManager(camCtrl, viewMgr);

  // 7. The usual render loop
  function animate(time) {
    requestAnimationFrame(animate);
    const delta = (time - sceneMgr.lastTime) / 1000 || 0;
    sceneMgr.lastTime = time;

    camCtrl.update(delta);
    sceneMgr.render(delta);
    uiMgr.update(delta, camCtrl);
  }
  animate();
})();
