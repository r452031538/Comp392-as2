const renderer = new THREE.WebGLRenderer();
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var controls,
    cubes = []

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

    scene.add(new THREE.AxesHelper(100));

    var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    var plane = new Physijs.BoxMesh (new THREE.BoxGeometry(10,-1,10), mat, 0);
    plane.position.set(0,-1,0);
    plane.receiveShadow = true;
    plane.__dirtyPosition = true;
    scene.add(plane);

    cubes.push(createPhysicsObject(-2,0,0,"r"));
    cubes.push(createPhysicsObject(-0.67,0,0,"r"));
    cubes.push(createPhysicsObject(0.67,0,0,"r"));
    cubes.push(createPhysicsObject(2,0,0,"r"));
    cubes.push(createPhysicsObject(-1.33,1,0,"r"));
    cubes.push(createPhysicsObject(0,1,0,"r"));
    cubes.push(createPhysicsObject(1.33,1,0,"b"));
    cubes.push(createPhysicsObject(-0.67,2,0,"b"));
    cubes.push(createPhysicsObject(0.67,2,0,"b"));
    cubes.push(createPhysicsObject(0,3,0,"y"));
}


 function createPhysicsObject(x, y, z, color = "r" ,friction = 0.3, restitution = 0.7, mass = 10) {
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
    scene.add(box);
    return box;
}

function readFile(port, filename) {
    let url = 'http://localhost:' + port + '/assets/games/' + filename + '.json';
    console.log('URL_TEST ' + url);
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.send();

    request.onload = () => {
        let data = request.responseText;
        console.log(data);
        //createGame(data)
        createGame(JSON.parse(data))
    }

}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(cubes);

    if ( intersects.length > 0 ) {
        scene.remove( intersect.object );
    }
}

function setupDatGui() {

    var controls = new function () {
        this.port = 3000;
        this.filename = 'file';
        this.CreateGame = function () {
            readFile(this.port, this.filename);
        }
    
    }
        var gui = new dat.GUI();
        gui.add(controls, 'port');
        gui.add(controls, 'filename');
        gui.add(controls, 'CreateGame');    
}

function render() {
/*
    cubes.forEach(cube => { 
        if(cube.box.position.y<0){
            scene.remove(cube.box);
            box.remove(cube);
        }
    });
    */
    scene.simulate(1,1);
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
