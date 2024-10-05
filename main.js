import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('theMoon').appendChild(renderer.domElement);

// Variables for animation
let mixer = null; 
let model = null; 

// Load the model
const loader = new GLTFLoader();
loader.load('/public/scene/scene.gltf', (gltf) => {
    model = gltf.scene;

    // Center the model in the scene
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    
    // Set initial rotation angle (for example, rotate 45 degrees around the Y-axis)
    model.rotation.y = 36; // 45 degrees in radians

    scene.add(model);

    // Setup mixer for animations
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
}, undefined, (error) => {
    console.error(`Error loading the model: ${error.message || error}`);
});

// Camera setup
camera.position.set(0, 0, 2.5);
camera.lookAt(0, 1, 0);

// Lighting setup
scene.add(new THREE.AmbientLight(0x1c1d1f, 1)); // Ambient light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2); 
directionalLight.position.set(5, 10, 30);
scene.add(directionalLight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.enableZoom = false;

// Render and animate the scene
const clock = new THREE.Clock();
const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (model) model.rotation.y += 0.001;

    controls.update();
    renderer.render(scene, camera);
};
animate();

// Handle window resize with debounce
let resizeTimeout;
const onResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
};

window.addEventListener('resize', onResize);
