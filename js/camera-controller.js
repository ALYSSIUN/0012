// /js/camera-controller.js
import * as THREE from 'three';
import { LOOK_SPEED, INIT_SPEED, MIN_SPEED, MAX_SPEED } from './constants.js';
import { clamp } from './utils.js';

export class CameraController {
  /**
   * @param {THREE.Scene} scene      – from SceneManager
   * @param {THREE.PerspectiveCamera} camera – from SceneManager
   * @param {HTMLElement} domElement – renderer.domElement
   */
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement || document.body;

    // 1. Create yaw→pitch rig
    this.pitchRig = new THREE.Object3D();
    this.yawRig = new THREE.Object3D();
    this.pitchRig.add(this.camera);
    this.yawRig.add(this.pitchRig);
    this.scene.add(this.yawRig);

    // 2. Initial positions
    this.camera.position.set(0, 0, 0);
    this.yawRig.position.set(2, 2, 5);

    // 3. Input state
    this.input = {
      keys: {},
      speed: INIT_SPEED,
      lookSpeed: LOOK_SPEED,
      pitch: 0,
      yaw: 0,
      rotating: false,
      touchPrevX: 0,
      touchPrevY: 0,
      joystickId: null,
      joystickVec: { x: 0, y: 0 }
    };

    // 4. Create joystick and up/down buttons
    this.createJoystickElements();

    // 5. Bind events (keyboard, mouse, touch)
    this.bindEvents();
  }

  bindEvents() {
    // ----- KEYBOARD (W,A,S,D + Arrows + Q,E) -----
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    // ----- MOUSE DOWN/UP for look (LMB or RMB) -----
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.input.rotating = true;
        this.domElement.requestPointerLock();
      }
    });
    this.domElement.addEventListener('mouseup', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.input.rotating = false;
        document.exitPointerLock();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.domElement) {
        this.input.rotating = false;
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.input.rotating) return;
      this.input.yaw   -= e.movementX * this.input.lookSpeed;
      this.input.pitch -= e.movementY * this.input.lookSpeed;
      this.input.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.input.pitch));
      this.yawRig.rotation.y   = this.input.yaw;
      this.pitchRig.rotation.x = this.input.pitch;
    });

    // ----- MOUSE WHEEL for speed -----
    this.domElement.addEventListener('wheel', (e) => {
      const delta = -e.deltaY * 0.002;
      this.input.speed = clamp(this.input.speed + delta, MIN_SPEED, MAX_SPEED);
    });

    // ----- TOUCH for mobile -----
    this.domElement.addEventListener('touchstart', (e) => {
      // Check if touching the fly buttons
      for (let t of e.touches) {
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && el.id === 'btn-up') {
          this.input.keys['KeyE'] = true;
          return;
        }
        if (el && el.id === 'btn-down') {
          this.input.keys['KeyQ'] = true;
          return;
        }
      }
      // Joystick reach: if one touches inside joystick base, ignore rotating
      if (this.isJoystickTouch(e.touches)) return;
      // Single‐finger touch for look
      if (e.touches.length === 1) {
        this.input.rotating   = true;
        this.input.touchPrevX = e.touches[0].pageX;
        this.input.touchPrevY = e.touches[0].pageY;
      }
    });
    this.domElement.addEventListener('touchmove', (e) => {
      // If rotating for look and not in joystick, move camera pitch/yaw
      if (this.input.rotating && !this.isJoystickTouch(e.touches)) {
        const touch = e.touches[0];
        const dx = touch.pageX - this.input.touchPrevX;
        const dy = touch.pageY - this.input.touchPrevY;
        this.input.yaw   -= dx * this.input.lookSpeed;
        this.input.pitch -= dy * this.input.lookSpeed;
        this.input.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.input.pitch));
        this.yawRig.rotation.y   = this.input.yaw;
        this.pitchRig.rotation.x = this.input.pitch;
        this.input.touchPrevX = touch.pageX;
        this.input.touchPrevY = touch.pageY;
      }
    });
    this.domElement.addEventListener('touchend', (e) => {
      // On touchend, clear rotating and up/down keys
      this.input.rotating = false;
      this.input.keys['KeyE'] = false;
      this.input.keys['KeyQ'] = false;
      // If joystick was controlling, release it
      for (let t of e.changedTouches) {
        if (t.identifier === this.input.joystickId) {
          this.resetThumb();
          this.input.joystickId = null;
          break;
        }
      }
    });
  }

  isJoystickTouch(touches) {
    if (this.input.joystickId !== null) return true;
    const baseRect = document.getElementById('joystickBase').getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
      const tx = touches[i].pageX, ty = touches[i].pageY;
      if (tx >= baseRect.left && tx <= baseRect.right && ty >= baseRect.top && ty <= baseRect.bottom) {
        return true;
      }
    }
    return false;
  }

  createJoystickElements() {
    // 1) Joystick Base
    this.joystickBase = document.createElement('div');
    this.joystickBase.id = 'joystickBase';
    this.joystickBase.style.display = 'none';

    this.joystickThumb = document.createElement('div');
    this.joystickThumb.id = 'joystickThumb';
    this.joystickBase.appendChild(this.joystickThumb);

    document.body.appendChild(this.joystickBase);

    // 2) Fly-up & Fly-down buttons exist in HTML (#btn-up, #btn-down)

    // 3) Show joystick base on touchstart, hide on touchend
    window.addEventListener('touchstart', () => {
      this.joystickBase.style.display = 'block';
    });
    window.addEventListener('touchend', () => {
      this.joystickBase.style.display = 'none';
    });

    // 4) Bind base’s own touch events to move/reset the thumb
    this.joystickBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.input.joystickId !== null) return;
      const t = e.changedTouches[0];
      this.input.joystickId = t.identifier;
      this.moveThumb(t.pageX, t.pageY);
    });

    this.joystickBase.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.input.joystickId) {
          this.moveThumb(t.pageX, t.pageY);
          break;
        }
      }
    });

    this.joystickBase.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.input.joystickId) {
          this.resetThumb();
          this.input.joystickId = null;
          break;
        }
      }
    });
  }

  moveThumb(pageX, pageY) {
    const baseRect = this.joystickBase.getBoundingClientRect();
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;
    const dx = pageX - centerX;
    const dy = pageY - centerY;

    const maxDist = (baseRect.width / 2) - (this.joystickThumb.offsetWidth / 2);
    const dist = Math.hypot(dx, dy);
    const clampedDist = dist > maxDist ? maxDist : dist;
    const angle = Math.atan2(dy, dx);

    const thumbX = clampedDist * Math.cos(angle);
    const thumbY = clampedDist * Math.sin(angle);
    this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    this.input.joystickVec.x = (thumbX / maxDist);
    this.input.joystickVec.y = -(thumbY / maxDist);
  }

  resetThumb() {
    this.joystickThumb.style.transform = `translate(0px, 0px)`;
    this.input.joystickVec.x = 0;
    this.input.joystickVec.y = 0;
  }

  update(delta) {
    this.updateFreeFly();
  }

  updateFreeFly() {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward).normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    const move = new THREE.Vector3();

    if (this.input.keys['KeyW']    || this.input.keys['ArrowUp'])    move.add(forward);
    if (this.input.keys['KeyS']    || this.input.keys['ArrowDown'])  move.sub(forward);
    if (this.input.keys['KeyD']    || this.input.keys['ArrowRight']) move.add(right);
    if (this.input.keys['KeyA']    || this.input.keys['ArrowLeft'])  move.sub(right);

    // Q/E: descend/ascend
    if (this.input.keys['KeyE']) move.y += 1;
    if (this.input.keys['KeyQ']) move.y -= 1;

    // Joystick (x = strafe, y = forward/back)
    if (Math.abs(this.input.joystickVec.x) > 0.01) {
      move.add(right.clone().multiplyScalar(this.input.joystickVec.x));
    }
    if (Math.abs(this.input.joystickVec.y) > 0.01) {
      move.add(forward.clone().multiplyScalar(this.input.joystickVec.y));
    }

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(this.input.speed);
      this.yawRig.position.add(move);
    }
  }
}
