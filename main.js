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

// Raycaster and mouse for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isModelSelected = false;

// Load the model
const loader = new GLTFLoader();
loader.load('public/scene/scene.gltf', (gltf) => {
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

// Event listener for mouse clicks
window.addEventListener('click', (event) => {
    // Convert mouse click position to normalized device coordinates (-1 to +1 range)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster based on the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if the model was clicked
    if (model) {
        const intersects = raycaster.intersectObject(model, true);
        if (intersects.length > 0) {
            isModelSelected = !isModelSelected; // Toggle model selection
        }
    }
});

// Render and animate the scene
const animate = () => {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    controls.update();

    // Rotate the model around the Y-axis for a soft rotation effect
    if (model && !isModelSelected) {
        model.rotation.y += 0.005; // Adjust the rotation speed as necessary
    }

    // Rotate the model around the Y-axis when clicked by the user
    if (isModelSelected && model) {
        model.rotation.y -= 0.005; // Faster rotation when clicked
    }

    // Update camera rotation to give floating effect
    cameraRotationAngle += 0.003; // Adjust the speed of camera rotation
    camera.position.x = cameraRadius * Math.sin(cameraRotationAngle);
    camera.position.z = cameraRadius * Math.cos(cameraRotationAngle);
    camera.lookAt(scene.position); // Keep the camera looking at the center of the scene

    renderer.render(scene, camera);
};
animate();


// Typing animation tools
const items = [
    "Javascript",
    "HTML",
    "THREE.js",
    "Node.js",
    "CSS",
    "MongoDB",
    "Express.js",
    "React.js",
    "..."
];

let index = 0; // Track the current item in the array
let currentText = ""; // Track the current text being typed
let isDeleting = false; // Track if it's deleting
const typingSpeed = 150; // Speed of typing in ms
const deletingSpeed = 100; // Speed of deleting in ms
const pauseBetweenWords = 1000; // Pause before deleting or typing the next word

function type() {
    const typingElement = document.getElementById("typing");

    if (isDeleting) {
        // Delete the text character by character
        currentText = items[index].substring(0, currentText.length - 1);
    } else {
        // Type the text character by character
        currentText = items[index].substring(0, currentText.length + 1);
    }

    // Update the content of the typing element
    typingElement.textContent = currentText;

    if (!isDeleting && currentText === items[index]) {
        // If the word is fully typed, wait for a while before deleting
        setTimeout(() => {
            isDeleting = true;
            type(); // Continue typing
        }, pauseBetweenWords);
    } else if (isDeleting && currentText === "") {
        // If the word is fully deleted, move to the next word
        isDeleting = false;
        index = (index + 1) % items.length; // Loop back to the first word after the last one
        setTimeout(type, typingSpeed); // Start typing the next word
    } else {
        // Continue typing or deleting
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        setTimeout(type, speed);
    }
}

// Start the typing effect
type();





//   Animation h3abouttitle


// The text to be type

  const text = "Hi! I'm Tarik";
  const h3Element = document.querySelector('#about-title'); // Adjust selector if needed

  function typeText(text, element) {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index); // Add one character at a time
        index++;
      } else {
        clearInterval(interval); // Stop typing once complete
      }
    }, 100); // Speed of typing (100ms per character)
  }

  // Start the typing animation after 8 seconds
  setTimeout(() => {
    if (h3Element) {
      typeText(text, h3Element);
    } else {
      console.error("Element not found");
    }
  }, 8000);


//   Email sending logic 

// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('contact_form');
  
//     form.addEventListener('submit', function (event) {
//       event.preventDefault(); // Prevent form from reloading the page
  
//       const serviceID = 'service_xn80acr'; // Replace with your EmailJS service ID
//       const templateID = 'template_4pxslyp'; // Replace with your EmailJS template ID
  
//       emailjs.sendForm(serviceID, templateID, this)
//         .then(() => {
//           alert('Message sent successfully!');
//           form.reset(); // Clear the form fields
//         })
//         .catch((error) => {
//           console.error('Email sending failed:', error);
//           alert('Failed to send message. Please try again.');
//         });
//     });
//   });
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact_form'); // Use class selector
    console.log(form); // Check if the form is found
  
    if (!form) {
      console.error('Form not found. Ensure the element class matches.');
      return;
    }
  
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent page reload
  
      const serviceID = 'service_xn80acr'; // Replace with your EmailJS service ID
      const templateID = 'template_4pxslyp'; // Replace with your EmailJS template ID
  
      emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
          alert('Message sent successfully!');
          form.reset(); // Clear form fields
        })
        .catch((error) => {
          console.error('Email sending failed:', error);
          alert('Failed to send message. Please try again.');
        });
    });
  });
  
//   NAVBAR


  let lastScrollTop = 0;
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
      // Scrolling down
      navbar.style.top = '-60px'; // Adjust the value to the height of your navbar
    } else {
      // Scrolling up
      navbar.style.top = '0';
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
  });
