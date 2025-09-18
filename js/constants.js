// /js/constants.js

export const CAMERA_FOV = 75;
export const NEAR_PLANE = 0.1;
export const FAR_PLANE = 1000;

export const LOOK_SPEED = 0.002;
export const INIT_SPEED = 0.01;
export const MIN_SPEED = 0.01;
export const MAX_SPEED = 1.0;

export const VIEWS = {
  // “Start Point” is where the camera will initially sit on page load.
  // After 1 second, index.js will automatically call goToView('home').
  'Start Point': {
    position: [ 17.01, -0.73, 19.12 ],
    rotation: [ -8.77, 74.56 ]
  },

  // the normal “home” landing‐spot (identical to Start Point in this example)
  home: {
    position: [ 7.69, -1.87, 16.87 ],
    rotation: [ -3.04, 77.42 ]
  },

  explore: {
    position: [ 2.00, 5.35, 3.26 ],
    rotation: [ -17.03, -330.75 ]
  },

  about: {
    position: [ 7.19, 10.50, -38.12 ],
    rotation: [ -16.80, -197.03 ]
  },

  contact: {
    position: [  7.86, -0.96, 15.63 ],
    rotation: [   -16.45, 196.94 ]
  }
};
