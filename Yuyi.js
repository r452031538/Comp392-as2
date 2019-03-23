/// <reference path="libs/three.min.js" />
/// <reference path="libs/physijs_worker.js" />
/// <reference path="libs/ammo.js" />
/// <reference path="libs/dat.gui.min.js" />
/// <reference path="libs/orbitcontrols.js" />

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'libs/ammo.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

var orbitControls, controls,
    speed = 0.01,
    toRotate = true;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    scene.setGravity(new THREE.Vector3(0,-50,0));
    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

}

function setupCameraAndLight() {
    camera.position.set(0, 20, 20);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x666666));

    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(20, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {

    // scene.add(new THREE.AxesHelper(100));
    // var blockGeom = new THREE.BoxGeometry(40, 0.2, 60);
    // let blockMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({
    //     color: 0xff7777, transparent: true, opacity: 0.9
    // }),
    //     0.3,       //friction
    //     0.7); //restitution 

    // let block = new Physijs.BoxMesh(blockGeom, blockMat, 0);
    // scene.add(block);
    // block.castShadow = true;
    var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xff0000 }));

    var mesh = new Physijs.BoxMesh (new THREE.BoxGeometry(0.6), mat, 0);
    var mesh1 = new Physijs.BoxMesh (new THREE.BoxGeometry(0.6), mat, 0);
    //mesh.setGravity(new THREE.Vector3(0,-50,0));
    scene.add(mesh);
    scene.add(mesh1);
    mesh1.position.set(0,3,0);
    mesh.__dirtyPosition = true;
    mesh1.__dirtyRotation = true;
    
    



}


 function createPhysicsObject(x, y, z, friction = 0.3, restitution = 0.7, mass = 10) {

     var blockGeom = new THREE.BoxGeometry(1, 1, 1);
     let blockMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({
         color: 0x7777ff, transparent: true, opacity: 0.9
     }), friction, restitution);
     let block = new Physijs.BoxMesh(blockGeom, blockMat, mass);
       block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.__dirtyRotation = true;
    scene.add(block);
    return block;
}
function setupDatGui() {

    controls = new function() {

        this.rotate = toRotate;

    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotate').onChange((e) => toRotate = e);
    //let upperFolder = gui.addFolder('Upper arm');
    //upperFolder.add(controls, 'upperRotationX', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationY', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationZ', -Math.PI * 0.5, Math.PI * 0.5);

    
    //gui.add(controls, 'stop').name('Stop rotation').onChange((stop) => speed = !stop ? 0.01 : 0);

}

function render() {

    orbitControls.update();
    if (toRotate)
        scene.rotation.y += speed;//rotates the scene  
    renderer.render(scene, camera);
    scene.simulate(undefined, 1);
    requestAnimationFrame(render);
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
