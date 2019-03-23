Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

const renderer = new THREE.WebGLRenderer();
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var controls,
    boxes = [],
    score=0
    port=3000
    gameSelect=1;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004444);
    renderer.shadowMap.enabled = true;

    scene.setGravity(new THREE.Vector3(0,-50,0));
    document.body.appendChild(renderer.domElement);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function setupCameraAndLight() {
    camera.position.set(0, 4, 10);
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
    var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    var plane = new Physijs.BoxMesh (new THREE.BoxGeometry(10,-1,10), mat, 0);
    plane.position.set(0,-1,0);
    plane.receiveShadow = true;
    plane.__dirtyPosition = true;
    scene.add(plane);

    createPhysicsObject(1,2,3);

    readFile(port, this.filename);
}


 function createPhysicsObject(x, y, z, color = "r" ,friction = 0.3, restitution = 0.7, mass = 1) {
    var geom = new THREE.BoxGeometry(1, 1, 1);
    let mat;
    switch(color){
         case "r":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 }), friction, restitution);
         break;
         case "b":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 }), friction, restitution);
         break;
         case "y":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 }), friction, restitution);
         break;
         default:
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), friction, restitution);
         break;
    } 
    let box = new Physijs.BoxMesh(geom, mat, mass);
    box.position.set(x, y, z);
    box.castShadow = true;
    box.receiveShadow = true;
    box.__dirtyRotation = true; 
    box._dirtyRotation = true;
    boxes.push(box);
    scene.add(box);
}

function readFile(port) {
    let url = 'http://localhost:' + port + '/assets/game'+this.gameSelect+'.json';
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.send();

    request.onload = () => {
        let data = request.responseText;
        createGame(JSON.parse(data))
    }
}
function createGame(gameData){
    boxes.forEach(box => {
        scene.remove(box);
    });
    boxes=[];

    for (let i = 0; i < gameData.length; i++) {
        createPhysicsObject(gameData[i].x,gameData[i].y,gameData[i].z,gameData[i].color);
    }
}


function onDocumentMouseDown( event ) {
    event.preventDefault();
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(boxes);

    if ( intersects.length > 0 ) {
        scene.remove(intersects[0].object);
        score ++;
    }
}

function setupDatGui() {

    var controls = new function () {
        this.port = port;
        this.gameSelect = gameSelect;
        this.CreateGame = function () {
            readFile(this.port, this.filename);
        }
    
    }
        var gui = new dat.GUI();
        gui.add(controls, 'port').onChange((x) => port = x);
        gui.add(controls, 'gameSelect',1,5).step(1).onChange((x) => gameSelect = x);
        gui.add(controls, 'CreateGame');    
}

function boxFallCheck(){
    boxes.forEach(box => { 
        if(box.position.y<-1){
            scene.remove(box);
        }
    });
}

function render() {
    scene.simulate(1,1);
    boxFallCheck();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
