import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const SCENE_BACKGROUND_COLOR = 0x94E7FE;
const CAMERA_FOV = 90;



// Add Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#bg"),
});

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);

// Set up camera
const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  0.1,
  50000
);
camera.position.set(-81.57168268729306, 130.8036188317595, -152.41401881252236);

// Miscellaneous
const controls = new OrbitControls(camera, renderer.domElement);

controls.target = new THREE.Vector3(60, -25, 66);



// Lighting
const hemiLight = new THREE.HemisphereLight(0x66ffff, 0x66ffff, 4);
const spotLight = new THREE.SpotLight(0xffa95c, 10);
const directionalLight = new THREE.DirectionalLight(0xFFA517, 0.1);
scene.add(directionalLight);

spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;
scene.add(hemiLight, spotLight);


const puck = (cords, color) => {
  const topPuckGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1.8, 32);
  const bottomPuckGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 32);

  const puckMaterial = new THREE.MeshBasicMaterial({ color: color });
  const topPuck = new THREE.Mesh(topPuckGeometry, puckMaterial);
  const bottomPuck = new THREE.Mesh(bottomPuckGeometry, puckMaterial);

  topPuck.position.set(cords[0], cords[1] + 1.8, cords[2]);
  bottomPuck.position.set(cords[0], cords[1], cords[2]);

  scene.add(topPuck, bottomPuck);
};

function AddRandomPucks() {
  const puckPos = [];

  while (puckPos.length < 5) {
    let randNumsX = Math.floor(Math.random() * 7) * 16;
    let randNumsY = Math.floor(Math.random() * 5) * 17;

    const coord = [randNumsX, 0, randNumsY];

    let inArray = false;

    const a = JSON.stringify(puckPos);
    const b = JSON.stringify(coord);

    const c = a.indexOf(b);
    if (c != -1) {
      inArray = true;
    }

    if (!inArray && coord != [0, 0, 0]) {
      puckPos.push(coord);
    }
  }

  for (let i = 0; i < 5; i++) {
    puck(puckPos[i], 0xff4d4d);
  }
}

AddRandomPucks();

// Models
const gltfLoader = new GLTFLoader();

const carMoveSpeed = 0.3;
const carTurnSpeed = 0.02;
let carModel;
let carPos = [0, 0];
let carRot = -Math.PI / 2;

let moveDir = 0;

gltfLoader.load("/car/Wagen.gltf", (gltf) => {
  carModel = gltf.scene;

  carModel.rotation.y = carRot;
  carModel.position.set(0, 1.6, 0);
  carModel.scale.set(0.03, 0.03, 0.03);

  scene.add(carModel);
});

let grijpArm;

let armRot = {y: -Math.PI / 2, x:0, z:0}
const myAxis = new THREE.Vector3(0, 0, 1);
let armQuaternion = new THREE.Quaternion();



gltfLoader.load("/car/Grijparm.gltf", (gltf) => {
  grijpArm = gltf.scene;

  grijpArm.rotation.y = carRot + armRot.y;
  grijpArm.position.set(0, 1.6, 4);
  grijpArm.scale.set(0.03, 0.03, 0.03);

  scene.add(grijpArm);
});

let island


gltfLoader.load(
   "/island/IslandWithRiver6.gltf",
   ( gltf ) => {
      let scale = 500;
      island = gltf.scene;
      island.scale.set (scale,scale,scale);
      island.position.set ( 56.2, -7.5, 40.5 );
      island.traverse((n) => {
        if (n.isMesh) {
          
          n.castShadow = true;
          n.receiveShadow = true;
          if (n.material.map) n.material.map.anistropy = 16;
        }
      });
      scene.add(island)
  },
);

// let cloud1

// gltfLoader.load(
//   "/island/Cloud1.gltf",
//   ( gltf ) => {
//      let scale = 500;
//      cloud1 = gltf.scene;
//      cloud1.scale.set (scale,scale,scale);
//      cloud1.position.set( 56.2, 10, 40.5 );
//      cloud1.traverse((n) => {
//        if (n.isMesh) {
//          n.castShadow = true;
//          n.receiveShadow = true;
//          if (n.material.map) n.material.map.anistropy = 16;
//        }
//      });
//      const mixer = new THREE.AnimationMixer( gltf );
//      const clips = gltf.animations;

//       // Update the mixer on each frame
//      function update () {
//       mixer.update( deltaSeconds );
// }

//     //  console.log(gltf.animations)
//     //  console.log(gltf)

     
     
//      // Play a specific animation
//      const clip = THREE.AnimationClip.findByName( clips, 'Cloud1Action' );
//      console.log(clip)
//      const action = mixer.clipAction( clip );
//      action.play();
     
//     //  Play all animations
//     //  clips.forEach( function ( clip ) {
//     //    mixer.clipAction( clip ).play();
//     //  } );
//      scene.add(cloud1)
//  },
// );


spotLight.position.set(
  camera.position.x + 100,
  camera.position.y + 10,
  camera.position.z + 10
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  if (moveDir === 1) {
    carPos[0] += Math.cos(carRot) * carMoveSpeed;
    carPos[1] -= Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir === 2) {
    carPos[0] -= Math.cos(carRot) * carMoveSpeed;
    carPos[1] += Math.sin(carRot) * carMoveSpeed;
  } else if (moveDir === 3) {
    carRot += carTurnSpeed;
    armQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), carTurnSpeed);
    grijpArm.quaternion.multiplyQuaternions(armQuaternion, grijpArm.quaternion);
  } else if (moveDir === 4) {
    carRot -= carTurnSpeed;
    armQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -carTurnSpeed);
    grijpArm.quaternion.multiplyQuaternions(armQuaternion, grijpArm.quaternion);
  } else if (moveDir === 5) {
    armQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 200);
    grijpArm.quaternion.multiplyQuaternions(grijpArm.quaternion, armQuaternion);

  } else if (moveDir === 6) {
    armQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 200);
    grijpArm.quaternion.multiplyQuaternions(grijpArm.quaternion, armQuaternion);

  }
  if (carModel && grijpArm) {
    console.log(armQuaternion )
    carModel.position.set(carPos[0], 1.6, carPos[1]);
    carModel.rotation.y = carRot;
    grijpArm.position.set(carPos[0] + 4* Math.cos(carRot), 1.6, carPos[1] - 4 * Math.sin(carRot))

  }
}

animate();

// INPUT
const directions = {
  forward: 1,
  backward: 2,
  left: 3,
  right: 4,
  turnXM: 5,
  turnXP: 6,

};

const buttons = document.querySelectorAll(".inputButton");
buttons.forEach((button) => {
  button.addEventListener("mousedown", () => {
    const direction = directions[button.id];
    moveDir = direction;
    SendDir(button.id);
  });
});

buttons.forEach((button) => {
  button.addEventListener("mouseup", () => {
    moveDir = 0;
    SendDir("stop");
  });
});

let socket = undefined;
let statusComponent = document.querySelector("#status").textContent;

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    statusComponent = "Status: Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    statusComponent = "Status: Disconnected";
  });

  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    statusComponent = "Status: Disconnected";
  });
}

function disconnect_socket() {
  if (socket != undefined) {
    socket.close();
  }
}

function sendCommand(command) {
  if (socket != undefined) {
    socket.send(command);
  } else {
    alert("Not connected to the PICO");
  }
}

function SendDir(dir) {
  if (socket != undefined) {
    socket.send(dir);
  } else {
    console.log("Not connected to the PICO");
  }
}

const socketButton = document.querySelector("#connectButton");

socketButton.addEventListener("mousedown", () => {
  connect_socket();
});

// controls.addEventListener("change", () => {  
//   console.log( controls.object.position ); 
//   console.log(controls.target)
// });

