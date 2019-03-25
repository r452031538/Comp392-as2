Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

const renderer = new THREE.WebGLRenderer();
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var controls,
    boxes = [],
    score=0,
    scoreObj,
    port=8080,
    gameSelect=1,
    canvas2,
    textMesh;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004444);
    renderer.shadowMap.enabled = true;

    scene.setGravity(new THREE.Vector3(0,-50,0));
    document.body.appendChild(renderer.domElement);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false);
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

    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {
    var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    var plane = new Physijs.BoxMesh (new THREE.BoxGeometry(10,-1,10), mat, 0);
    plane.position.set(0,-1,0);
    plane.receiveShadow = true;
    scene.add(plane);
    

    updateText("score:"+score);

    readFile();
}


 function createPhysicsObject(x, y, z, color = "r") {
    var geom = new THREE.BoxGeometry(1, 1, 1);
    let mat;
    switch(color){
         case "r":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 }), Math.random(0,1), Math.random(0,1));
         break;
         case "b":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 }), Math.random(0,1), Math.random(0,1));
         break;
         case "y":
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 }), Math.random(0,1), Math.random(0,1));
         break;
         default:
         mat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), Math.random(0,1), Math.random(0,1));
         break;
    } 
    let box = new Physijs.BoxMesh(geom, mat, 1);
    box.position.set(x, y, z);
    box.castShadow = true;
    box.receiveShadow = true;
    box.__dirtyPosition = true;
    box.__dirtyRotation = true;
    boxes.push(box);
    scene.add(box);
}

function readFile() {
//attempting to read from json

    /*
    let url = 'http://localhost:' + port + '/assets/game'+this.gameSelect+'.json';
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.send();

    request.onload = () => {
        let data = request.responseText;
        createGame(JSON.parse(data))
    }*/

    
    
   var a=[
       {x:-1.67,y:1,z:0,color:"r"},
       {x:0,y:1,z:0,color:"b"},
       {x:1.67,y:1,z:0,color:"y"}
   ]
   createGame(a)
   
}
function createGame(gameData){
    boxes.forEach(box => {
        scene.remove(box);
    });
    boxes=[];
    score=0;
    for (let i = 0; i < gameData.length; i++) {
        createPhysicsObject(gameData[i].x,gameData[i].y,gameData[i].z,gameData[i].color);
    }
}


function onDocumentMouseDown( event ) {
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(boxes);

    if ( intersects.length > 0 ) {
        scene.remove(intersects[0].object);
        for( var i = 0; i < boxes.length; i++){ 
            if ( boxes[i] === intersects[0].object) {
                boxes.splice(i, 1); 
            }
         }
        score ++;
        updateText("score:"+score);
    }
}

function setupDatGui() {
    var controls = new function () {
        this.port = '5500';
        this.gameSelect = gameSelect;
        this.CreateGame = function () {
            readFile();
        }
    
    }

    const ports=[5500,8080];
        var gui = new dat.GUI();
        gui.add(controls,'port').onChange((x) => port = parseInt(x));
        // line1.onChange((x) => port = parseInt(x));
    // line1.onChange.onChange(function(newValue) {
    //         console.log("Value changed to:  ", newValue);
    //     });
        // gui.add(controls, "text1").listen();
        // gui.add(controls, 'port',ports).onChange((x) => port = parseInt(x));
         gui.add(controls, 'gameSelect',1,5).step(1).onChange((x) => gameSelect = x);
         gui.add(controls, 'CreateGame');   
         
}

function boxFallCheck(){
    boxes.forEach(box => { 
        if(box.position.y<-1){
            scene.remove(box);
            for( var i = 0; i < boxes.length; i++){ 
                if ( boxes[i] === box) {
                    boxes.splice(i, 1); 
                }
             }
            score--;
            updateText("score:"+score);
        }
    });
}

function gameWinCheck(){
    if(boxes.length==0){
        if(score>0){
            updateText("you win");
        }else{
            updateText("you lose");
        }
        readFile();
    }
}

function updateText(textt){
    try{scene.remove(textMesh);}catch(error){}
    canvas2 = document.createElement('canvas');
	var context = canvas2.getContext('2d');
	context.font = "Bold 50px Arial";
	context.fillStyle = "rgba(255,255,255,1)";
    canvas2.getContext('2d').fillText(textt, 0, 50);
	var textTexture = new THREE.Texture(canvas2) 
	textTexture.needsUpdate = true;
    var textMaterial = new THREE.MeshBasicMaterial( {map: textTexture, side:THREE.DoubleSide } );
    textMaterial.transparent = true;
    textMesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas2.width, canvas2.height),textMaterial);
    textMesh.scale.set(0.02,0.02,0.02);
    textMesh.position.set(-6,2,-2);
	scene.add(textMesh);
}

function render() {
    scene.simulate(1,1);
    boxFallCheck();
    gameWinCheck();
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


