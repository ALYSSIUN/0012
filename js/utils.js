// /js/utils.js
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function toDeg(rad) {
  return rad * (180 / Math.PI);
}
