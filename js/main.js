import { creaDipinti } from "./dipinti.js";
import * as THREE from "./three.js";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { displayPaintingInfo, hidePaintingInfo } from "./infoDipinti.js";
import { addObjectsToScene } from "./aggiungiOggettiAllaScena.js";
const scene = new THREE.Scene();
//Camera
const camera = new THREE.PerspectiveCamera(
  75, //field of view / campo visivo
  window.innerWidth / window.innerHeight, // aspect ratio
  1, //near
  1000 // far
);

scene.add(camera);
camera.position.z = 5; //move the camera back 5 units
camera.position.y = 3; //move the camera back 5 units
//Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // background color
document.body.appendChild(renderer.domElement);

//let there be light!
// Ambient light
const ambientLight = new THREE.AmbientLight(0x101010, 1.0); //color, intensity,distance,decay
ambientLight.position.x = camera.position.x; //Light follows camera
ambientLight.position.y = camera.position.y; //Light follows camera
ambientLight.position.z = camera.position.z; //Light follows camera

scene.add(ambientLight);

// Directional light
const sunLight = new THREE.DirectionalLight();
sunLight.position.y = 15;
scene.add(sunLight);
//texture loader
const textureLoader = new THREE.TextureLoader();

//Textures
let texturePavimento = new THREE.TextureLoader().load("../img/texture/floor.jpg");

//crea il pavimento
const geometriaPavimento = new THREE.PlaneGeometry(50, 50);
const materialePavimento = new THREE.MeshBasicMaterial({
  map: texturePavimento,
  side: THREE.DoubleSide,
});
let pavimento = new THREE.Mesh(geometriaPavimento, materialePavimento);

pavimento.rotation.x = Math.PI / 2; //this is 90 degrees
pavimento.position.y = -Math.PI;

scene.add(pavimento);

//Create the walls
const wallGroup = new THREE.Group(); //create a group to hold the walls
scene.add(wallGroup);
//wall texture
const wallTexture = new THREE.TextureLoader().load("./img/texture/wall.jpg");

//Front Wall
const frontWallGeometry = new THREE.BoxGeometry(50, 20, 0.001);
const frontWallMaterial = new THREE.MeshBasicMaterial({
  map: wallTexture,
});
const frontWall = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
frontWall.position.z = -25;

//left wall
const leftWallGeometry = new THREE.BoxGeometry(50, 20, 0.001);
const leftWallMaterial = new THREE.MeshBasicMaterial({
  map: wallTexture,
});
const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -25;
//muro di destra
const rigthWallGeo = new THREE.BoxGeometry(50, 20, 0.001);
const rightWallMaterial = new THREE.MeshBasicMaterial({
  map: wallTexture,
});

const rightWall = new THREE.Mesh(rigthWallGeo, rightWallMaterial);
rightWall.rotation.y = Math.PI / 2;
rightWall.position.x = 25;
//muro dietro
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20, 0.001),
  new THREE.MeshBasicMaterial({
    map: wallTexture,
  })
);
backWall.position.z = 25;

wallGroup.add(frontWall, leftWall, rightWall, backWall);
//crea il bounding box
for (let index = 0; index < wallGroup.children.length; index++) {
  wallGroup.children[index].BBox = new THREE.Box3();
  wallGroup.children[index].BBox.setFromObject(wallGroup.children[index]);
}
function checkCollision() {
  const playerBoundingBox = new THREE.Box3(); //crea un bounding box per il giocatore
  const cameraWorldPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraWorldPosition);

  playerBoundingBox.setFromCenterAndSize(
    cameraWorldPosition,
    new THREE.Vector3(1, 1, 1)
  );

  for (let index = 0; index < wallGroup.children.length; index++) {
    const wall = wallGroup.children[index]; //ottien un singolo muro
    if (playerBoundingBox.intersectsBox(wall.BBox)) {
      return true;
    }
  }
  return false;
}
//Create the ceiling
const ceilingTexture = textureLoader.load("../img/texture/ceiling.jpg")
const ceilingGeo = new THREE.PlaneGeometry(50, 50);
const ceilingMaterial = new THREE.MeshBasicMaterial({
  map:ceilingTexture,
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 10;
scene.add(ceiling);

function creaDipinto(imageURL, width, height, position) {
  const textureDipinto = new THREE.TextureLoader().load(imageURL);
  const geometriaDipinto = new THREE.PlaneGeometry(width, height);
  const materialeDipinto = new THREE.MeshBasicMaterial({
    map: textureDipinto,
  });

  const dipinto = new THREE.Mesh(geometriaDipinto, materialeDipinto);
  dipinto.position.set(position.x, position.y, position.z);

  scene.add(dipinto);
  return dipinto;
}


//Controls
const comandi = new PointerLockControls(camera, document.body);

//Lock the pointer (controls are activated) and hide the menu when the expierience starts
function cominiciaEsperienza() {
  //lock the pointer
  comandi.lock();
  //nascondi il menu
  hideMenu();
}
function hideMenu() {
  document.getElementById("background-menu").style.display = "none";
}
function showMenu() {
  document.getElementById("background-menu").style.display = "grid";
}
const playButton = document.getElementById("play-button");
playButton.addEventListener("click", cominiciaEsperienza);
comandi.addEventListener("unlock", showMenu);

const keyPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

//Event listener for when we press the keys
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key in keyPressed) {
      keyPressed[event.key] = true;
    }
  },
  false
);
//esegui questa funzione
document.addEventListener(
  "keyup",
  (event) => {
    if (event.key in keyPressed) {
      keyPressed[event.key] = false;
    }
  },
  false
);
const clock = new THREE.Clock(); //da cercare

function aggiornaMovimento(delta) {
  //right
  const moveSpeed = 10 * delta;

  const previousPosition = camera.position.clone();

  if (keyPressed.ArrowRight || keyPressed.d) {
    comandi.moveRight(moveSpeed);
  }
  //left
  else if (keyPressed.ArrowLeft || keyPressed.a) {
    comandi.moveRight(-moveSpeed);
  }
  //down
  else if (keyPressed.ArrowDown || keyPressed.s) {
    comandi.moveForward(-moveSpeed);
  }
  //up
  else if (keyPressed.ArrowUp || keyPressed.w) {
    comandi.moveForward(moveSpeed);
  }
  if (checkCollision()) {
    camera.position.copy(previousPosition);
  }
}
let paintings = creaDipinti(scene, textureLoader);
addObjectsToScene(scene, paintings);
//rendering

function render() {
  const delta = clock.getDelta();
  aggiornaMovimento(delta);
  const ditanceThreShold = 8;

  let paintToShow;

  paintings.forEach((painting) => {
    const distanceToPainting = camera.position.distanceTo(painting.position);
    if (distanceToPainting < ditanceThreShold) {
      paintToShow = painting;
    }
  });
  if (paintToShow) {
    displayPaintingInfo(paintToShow.userData.info);
  } else {
    hidePaintingInfo();
  }

  renderer.render(scene, camera); //renders the scene
  requestAnimationFrame(render);
}
render();