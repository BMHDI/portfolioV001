import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping for lighting effects
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smooth shadow edges
document.getElementById('theMoon').appendChild(renderer.domElement);

// Variables for animation
let mixer = null; 
let model = null; 
const clock = new THREE.Clock();

// Camera rotation variables
let cameraRotationAngle = 0; // Initial angle for camera rotation
const cameraRadius = 2.5; // Distance from the object (radius of the circular path)

// Load the model
const loader = new GLTFLoader();
loader.load('/public/scene/scene.gltf', (gltf) => {
    model = gltf.scene;

    // Center the model in the scene
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.scale.set(0.8, 0.8, 0.8);
    model.position.set(-center.x - 0.6, -center.y + 0.8, -center.z - 0.9); // Positioning model

    scene.add(model);

    // Setup mixer for animations
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

    // Set the controls target to the center of the model
    controls.target.copy(center);
    controls.update();  // Update the controls to apply the new target

    // Adjust camera to look at the center of the model after it is loaded
    camera.position.set(0, 1, cameraRadius); // Adjust camera height for better view
    camera.lookAt(center);
}, undefined, (error) => {
    console.error(`Error loading the model: ${error.message || error}`);
});

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.enableRotate = true; 
controls.rotateSpeed = 0.5;
controls.enableZoom = false;

// Limit movement to Y-axis
controls.maxPolarAngle = Math.PI / 2; // Allow looking down to the horizon
controls.minPolarAngle = Math.PI / 2; // Prevent looking up

// Improved Lighting setup for darker atmosphere and shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.002); // Reduced ambient light intensity
scene.add(ambientLight);

// Set up Directional Light with shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.9); // Increased intensity for dramatic shadows
directionalLight.position.set(90, -30, 10); // Adjust the position for strong shadow effects
directionalLight.castShadow = true; // Enable shadow casting

// Configure shadow properties for smoother shadows
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;

scene.add(directionalLight);

// Optional: Hemisphere Light for extra ambient effect
const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.2); // Sky color and ground color for lighting
scene.add(hemisphereLight);

// Resize event handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render and animate the scene
const animate = () => {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    controls.update();

    // Rotate the model around the Y-axis for a soft rotation effect
    if (model) {
        model.rotation.y += 0.005; // Adjust the rotation speed as necessary
    }

    // Update camera rotation to give floating effect
    cameraRotationAngle += 0.003; // Adjust the speed of camera rotation
    camera.position.x = cameraRadius * Math.sin(cameraRotationAngle);
    camera.position.z = cameraRadius * Math.cos(cameraRotationAngle);
    camera.lookAt(scene.position); // Keep the camera looking at the center of the scene

    renderer.render(scene, camera);
};
animate();


// Text animation setup
// const texts = [
//     "Sky is the limit", 
//     "Sky is <span class='highlight'>NOT</span> the limit"
// ];

// let currentTextIndex = 0;
// let currentCharIndex = 0;
// let typingSpeed = 220; // Typing speed in milliseconds
// let deletingSpeed = 60; // Deleting speed in milliseconds
// let pauseBetweenActions = 150; // Pause time after typing before deleting

// const typingTextElement = document.getElementById("typingText");

// // Function to type the text with HTML support
// function typeText() {
//     const currentText = texts[currentTextIndex];
    
//     // Extract the visible part of the text up to currentCharIndex
//     typingTextElement.innerHTML = currentText.slice(0, currentCharIndex) + (currentCharIndex < currentText.length ? '|' : ''); // Add cursor

//     if (currentCharIndex < currentText.length) {
//         currentCharIndex++;
//         setTimeout(typeText, typingSpeed);
//     } else {
//         // Pause before starting to delete
//         setTimeout(deleteText, pauseBetweenActions);
//     }
// }

// Function to delete only the last two words
// function deleteText() {
//     let currentText = typingTextElement.textContent; // Get the current text content
//     const words = currentText.split(" "); // Split it into words
    
//     // Check if we are in the first text and there are more than 2 words
//     if (currentTextIndex === 0 && words.length > 2) {
//         // Remove only the last two words
//         words.splice(-2, 2);
//         typingTextElement.textContent = words.join(" ") + " "; // Rebuild the string without the last two words
//         setTimeout(deleteText, deletingSpeed); // Continue deleting slowly
//     } else if (currentTextIndex === 0) {
//         // Once last two words are deleted, proceed to the next text
//         currentTextIndex = 1; // Move to the next text
//         currentCharIndex = 0;
//         setTimeout(typeText, typingSpeed); // Start typing the second text
//     }
// }

// // Start the text animation
// typeText();
