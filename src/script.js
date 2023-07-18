import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexShader from './shaders/water/vertex.glsl'
import fragmentShader from './shaders/water/fragment.glsl'

/**
 * Audio setup
 */
let audioPlaying = false;
const audio = document.querySelector('audio');
let audioDataArray;
let analyser;

// Listen to play button, fetch audio file.
audio.addEventListener('playing', () => {
  prepareAudio();
  audioPlaying = true;
}); 

// Turn off vis. if audio paused.
audio.addEventListener('pause', () => {
  audioPlaying = false;
}); 

// Connects playing audio so that it can be visualizd.
const prepareAudio = () => {
  const audioContext = new AudioContext();
  const splitter = audioContext.createChannelSplitter();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 16384; // fftSize is number of samples "fast forier transform"

  splitter.connect(analyser);
  const bufferLength = analyser.frequencyBinCount;
  const source = audioContext.createMediaElementSource(audio);
  audioDataArray = new Uint8Array(bufferLength);
  source.connect(splitter);
  splitter.connect(audioContext.destination);
};

// Visualize
const visualize = () => {
  let audioValueHigh;
  let audioValueLow;

  analyser.getByteFrequencyData(audioDataArray);
  
  for (var i = 0; i<audioDataArray.length; i++) {
    // (23.4hz is 48000 (array) / fftsize (4096 - half sampled 2048))
    // so audioDataArray[0] is frequency strength from 0 to 23.4Hz.

    // get average range value of freq. strength to prevent
    // visual stutter.
    const arr = [audioDataArray[i-2], audioDataArray[i-1], audioDataArray[i], audioDataArray[i+1], audioDataArray[i+2]];
    const average = arr.reduce((a, b) => a + b, 0) / arr.length;

    // highend of midrange (500 Hz to 2 kHz)
    if (i > 290 && i < 330) {
      
      if (i > 310) {
        audioValueHigh = average / 75;
      } else {
        audioValueHigh = average / 150;
      }
    }

    // bass freq. range 60 to 250 Hz, so audioDataArray[10] * 23.4 = 234.
    if (i > 200 && i < 220) {
      audioValueLow = average / 75;
    }
  }
  
  planeMaterial.uniforms.uWavesElevation.value = audioValueHigh;
  planeMaterialR.uniforms.uWavesElevation.value = audioValueLow;
};
  
// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};
debugObject.deepColor = '#000000';
debugObject.surfaceColor = '#ff0000';

gui.addColor(debugObject, 'deepColor').onChange(() => { planeMaterial.uniforms.uDeepColor.value.set(debugObject.deepColor) });
gui.addColor(debugObject, 'surfaceColor').onChange(() => { planeMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
 const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Geometry
const planeGeometry = new THREE.PlaneGeometry(4, 4, 64, 64);
const planeGeometryR = new THREE.PlaneGeometry(4, 4, 64, 64);

// Material
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uWavesElevation: { value: 0.0 },
    uWavesFrequency: { value: new THREE.Vector2(4, 3) },
    uWavesSpeed: { value: 0.75 },

    uDeepColor: { value: new THREE.Color(debugObject.deepColor)},
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor)},
    uColorOffset: { value: 0.25 },
    uColorMultiplier: { value: 1.2 },
  }
})

const planeMaterialR = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uWavesElevation: { value: 0.0 },
    uWavesFrequency: { value: new THREE.Vector2(2.7, 2.7) },
    uWavesSpeed: { value: 0.5 },

    uDeepColor: { value: new THREE.Color(debugObject.deepColor)},
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor)},
    uColorOffset: { value: 0.25 },
    uColorMultiplier: { value: 1 },
  }
})

// left
gui.add(planeMaterial.uniforms.uWavesElevation, 'value').min(0).max(1).step(0.001).name('uWavesElevationL');
gui.add(planeMaterial.uniforms.uWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uWavesFrequencyL.x');
gui.add(planeMaterial.uniforms.uWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uWavesFrequencyL.y');
gui.add(planeMaterial.uniforms.uWavesSpeed, 'value').min(0).max(4).step(0.001).name('uWavesSpeedL');
gui.add(planeMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffsetL');
gui.add(planeMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplierL');

// right
gui.add(planeMaterialR.uniforms.uWavesElevation, 'value').min(0).max(1).step(0.001).name('uWavesElevation');
gui.add(planeMaterialR.uniforms.uWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uWavesFrequencyR.x');
gui.add(planeMaterialR.uniforms.uWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uWavesFrequencyR.y');
gui.add(planeMaterialR.uniforms.uWavesSpeed, 'value').min(0).max(4).step(0.001).name('uWavesSpeedR');


// Wireframe mesh
planeMaterial.wireframe = true;
planeMaterialR.wireframe = true;

// Mesh
const meshL = new THREE.Mesh(planeGeometry, planeMaterial);
const meshR = new THREE.Mesh(planeGeometryR, planeMaterialR);
meshL.rotation.x = - Math.PI * 0.5;
meshR.rotation.x = - Math.PI * 0.5;
meshL.position.x = -2.1;
meshR.position.x = 2.1;

scene.add(meshL);
scene.add(meshR);

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor( 0xffffff, 1 );

/**
 * Animate
 */
renderer.render(scene, camera);

const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  if (audioPlaying) {
    visualize();
  }
};

tick();