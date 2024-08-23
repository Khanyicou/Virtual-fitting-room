let scene, camera, renderer, controls;
let items = []; // Array to store added items
let selectedItem = null;

// Initialize the scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    // Add user interaction controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Render loop
    animate();
}

// Add a 3D clothing item to the scene
function addItem(type) {
    let geometry, material, mesh;

    switch (type) {
        case 'tshirt':
            geometry = new THREE.BoxGeometry(1, 1.5, 0.2); // Simplified t-shirt shape
            material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            break;
        case 'pants':
            geometry = new THREE.BoxGeometry(1, 1.5, 0.2); // Simplified pants shape
            material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
            break;
        default:
            return;
    }

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.userData.draggable = true;
    scene.add(mesh);
    items.push(mesh);

    // Make the new item selectable and draggable
    selectItem(mesh);
}

// Remove the last added item from the scene
function removeItem() {
    if (items.length > 0) {
        const item = items.pop();
        scene.remove(item);
    }
}

// Select an item to allow dragging
function selectItem(item) {
    selectedItem = item;
}

// Handle dragging of the selected item
function onDocumentMouseMove(event) {
    event.preventDefault();

    if (selectedItem) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(selectedItem);

        if (intersects.length > 0) {
            selectedItem.position.copy(intersects[0].point);
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Event listeners for dragging
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mouseup', () => (selectedItem = null), false);

// Initialize the fitting room
init();

function loadModel(path, onLoad) {
    const loader = new THREE.GLTFLoader();
    loader.load(path, function(gltf) {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
        scene.add(model);
        items.push(model);
        if (onLoad) onLoad(model);
    });
}

function addItem(type) {
    switch (type) {
        case 'tshirt':
            loadModel('path/to/tshirt.glb', selectItem);
            break;
        case 'pants':
            loadModel('path/to/pants.glb', selectItem);
            break;
        default:
            return;
    }
}

// Keycodes for control
const KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68;
const KEY_Q = 81, KEY_E = 69;
const KEY_UP = 38, KEY_DOWN = 40, KEY_LEFT = 37, KEY_RIGHT = 39;

function onDocumentKeyDown(event) {
    if (!selectedItem) return;

    switch (event.keyCode) {
        case KEY_W: // Move forward
            selectedItem.position.z -= 0.1;
            break;
        case KEY_S: // Move backward
            selectedItem.position.z += 0.1;
            break;
        case KEY_A: // Move left
            selectedItem.position.x -= 0.1;
            break;
        case KEY_D: // Move right
            selectedItem.position.x += 0.1;
            break;
        case KEY_Q: // Rotate left
            selectedItem.rotation.y -= 0.1;
            break;
        case KEY_E: // Rotate right
            selectedItem.rotation.y += 0.1;
            break;
        case KEY_UP: // Scale up
            selectedItem.scale.multiplyScalar(1.1);
            break;
        case KEY_DOWN: // Scale down
            selectedItem.scale.multiplyScalar(0.9);
            break;
    }
}

// Add event listener for keyboard controls
document.addEventListener('keydown', onDocumentKeyDown, false);

function addPhysicsToItem(mesh) {
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.75, 0.1)); // Adjust size
    const body = new CANNON.Body({
        mass: 1,
        material: physicsMaterial,
    });
    body.addShape(shape);
    body.position.copy(mesh.position);
    world.addBody(body);
    mesh.userData.physicsBody = body;
}

function updatePhysics() {
    world.step(1 / 60);
    items.forEach((mesh) => {
        if (mesh.userData.physicsBody) {
            mesh.position.copy(mesh.userData.physicsBody.position);
            mesh.quaternion.copy(mesh.userData.physicsBody.quaternion);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    controls.update();
    renderer.render(scene, camera);
}

