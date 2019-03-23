/// <reference path="libs/three.min.js" />
/// <reference path="libs/trackballcontrols.js" />
/// <reference path="libs/dat.gui.min.js" />
///<reference path="libs/physijs_worker.js" />
/// <reference path="libs/ammo.js" />


Physijs.scripts.worker = '/libs/physijs_worker.js';
Physijs.scripts.ammo = '/libs/ammo.js';

//Marvin Jupiter Vargas
//Centennial College
//January 24, 2019

//recurrent const
const scene = new Physijs.Scene();
//const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var boxes = [];
var container = new THREE.Object3D();

//global variables
//var trackballControls;
var ambient;

var boxGeo, boxThreeMat, boxPhysiMat;

var score = 0;
var scoreText = 'Score: ' + score;

var clickedOn = null;

function init() {
    //the renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setClearColor(new THREE.Color(0X0095DE));
    scene.background = new THREE.Color(0X0095DE);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.setGravity(new THREE.Vector3(0, -50, 0));
    //trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

    window.addEventListener('mousedown', MouseDown, false);

}
function MouseDown(event) {
    event.preventDefault();

    mouse.x = (event.layerX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.layerY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(boxes);
    if (intersects.length > 0) {


        var res = intersects.filter(function (res) {
            return res && res.object;
        })[0];
        if (res && res.object) {
            clickedOn = res.object;
            clickedOn.material.color.set('#000');



            scene.remove(clickedOn);
            //boxes.remove(clickedOn);
            score = score + 1;
            console.log(boxes);
        }



    }

}
function setupCameraAndLight() {
    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = 80;
    camera.lookAt(scene.position);

    ambient = new THREE.AmbientLight(0xdddddd, 1);
    ambient.visible = true;
    scene.add(ambient);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 100, 1).normalize();
    light.castShadow = true;
    scene.add(light)


}
function createGeometry() {

    var axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);
    //plane Geo
    let planeGeometry = new THREE.PlaneGeometry(100, 50, 1, 1);
    let planeMaterial = new THREE.MeshLambertMaterial({ color: 0X4ff768 });
    let plane = new Physijs.PlaneMesh(planeGeometry, planeMaterial);
    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    scene.add(plane);
}
function createGame(data) {

    console.log('READING JSON ' + data[0].position.x);
    console.log(data.length);
    scene.add(container);
    for (i = 0; i < data.length; i++) {
        boxGeo = new THREE.BoxGeometry(
            data[i].size.width,
            data[i].size.height,
            data[i].size.length
        );
        boxThreeMat = new THREE.MeshLambertMaterial({
            color:
                data[i].color, transparent: true, opacity: 0.8
        });

        boxPhysiMat = Physijs.createMaterial(boxThreeMat, 0, 1);

        var box = new Physijs.BoxMesh(boxGeo, boxThreeMat, 5);
        box.receiveShadow = true;
        box.position.set(
            data[i].position.x,
            data[i].position.y,
            data[i].position.z,
        );
        box._dirtyPosition = true;
        box._dirtyRotation = true;

        boxes.push(box);
        container.add(box);

        scene.add(box);
    }
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
var controls = new function () {
    this.port = 3000;
    this.filename = 'marvin3';
    this.CreateGame = function () {
        readFile(this.port, this.filename);
    }

}
function GameGUI() {
    var gui = new dat.GUI();

    gui.add(controls, 'port');
    gui.add(controls, 'filename');
    gui.add(controls, 'CreateGame');





}
function render() {
    //update the controlls
    //trackballControls.update(clock.getDelta());
    scene.simulate(1, 1);
    renderer.render(scene, camera);
    renderer.castShadow = true;



    //to call itself
    requestAnimationFrame(render);

}
window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    GameGUI();
    render();

}