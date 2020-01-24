/*
 * UBC CPSC 314, Vjan2020
 * Assignment 1 Template
 */

// CHECK WEBGL VERSION
if ( WEBGL.isWebGL2Available() === false ) {
  document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
}

// SETUP RENDERER & SCENE
var container = document.createElement( 'div' );
document.body.appendChild( container );

var canvas = document.createElement("canvas");
var context = canvas.getContext( 'webgl2' );
var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );
renderer.setClearColor(0X80CEE1); // blue background colour
container.appendChild( renderer.domElement );
var scene = new THREE.Scene();

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30.0, 1.0, 0.1, 1000.0); // view angle, aspect ratio, near, far
camera.position.set(0.0,30.0,55.0);
camera.lookAt(scene.position);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera, container);
controls.damping = 0.2;
controls.autoRotate = false;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
 window.scrollTo(0,0);
}

// WORLD COORDINATE FRAME: other objects are defined with respect to it
var worldFrame = new THREE.AxesHelper(1) ;
scene.add(worldFrame);

// FLOOR WITH PATTERN
var floorTexture = new THREE.TextureLoader().load('images/floor.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(2, 2);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30.0, 30.0);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.1;
floor.rotation.x = Math.PI / 2.0;
scene.add(floor);
floor.parent = worldFrame;

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// MAGIC CIRCLE TEXTURE
var magicTexture = new THREE.TextureLoader().load('images/magic_circle.png');
magicTexture.minFilter = THREE.LinearFilter;

// UNIFORMS
var colorMap = {type: 't', value: magicTexture};
var magicPosition = {type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0)};
var eatspit = {type: 'f', value: 0.0}; // 0 for eat, 1 for spit
var objecttype = {type: 'f',value: 3.0}; // 0 for sphere, 1 for pyramid, 2 for torus, 3 for unselected
var flag = {type: 'f', value: 1.0}; // to implement the delay functionality


// MATERIALS: specifying uniforms and shaders
var wizardMaterial = new THREE.ShaderMaterial();
var itemMaterial = new THREE.ShaderMaterial();
var magicMaterial = new THREE.ShaderMaterial({
	side: THREE.DoubleSide,
	uniforms: {
    colorMap: colorMap,
    magicPosition: magicPosition,
    flag:flag,
    //eatspit:eatspit,
    //objecttype:objecttype
  }
});

var rotatingMaterial = new THREE.ShaderMaterial({
  uniforms: {
    eatspit:eatspit,
    objecttype:objecttype
  }
});

var disappearingMaterial = new THREE.ShaderMaterial();

// LOAD SHADERS
var shaderFiles = [
'glsl/wizard.vs.glsl',
'glsl/wizard.fs.glsl',
'glsl/item.vs.glsl',
'glsl/item.fs.glsl',
'glsl/magic.vs.glsl',
'glsl/magic.fs.glsl',
'glsl/disappearing.vs.glsl',
'glsl/disappearing.fs.glsl',
'glsl/rotating.vs.glsl',
'glsl/rotating.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  wizardMaterial.vertexShader = shaders['glsl/wizard.vs.glsl'];
  wizardMaterial.fragmentShader = shaders['glsl/wizard.fs.glsl'];

  itemMaterial.vertexShader = shaders['glsl/item.vs.glsl'];
  itemMaterial.fragmentShader = shaders['glsl/item.fs.glsl'];

  magicMaterial.vertexShader = shaders['glsl/magic.vs.glsl'];
  magicMaterial.fragmentShader = shaders['glsl/magic.fs.glsl'];

  rotatingMaterial.vertexShader = shaders['glsl/rotating.vs.glsl'];
  rotatingMaterial.fragmentShader = shaders['glsl/rotating.fs.glsl'];

  disappearingMaterial.vertexShader = shaders['glsl/disappearing.vs.glsl'];
  disappearingMaterial.fragmentShader = shaders['glsl/disappearing.fs.glsl'];

})



// OBJ LOADER
function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log( item, loaded, total );
  };

  var onProgress = function (xhr) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100.0;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };

  var onError = function (xhr) {
  };

  var loader = new THREE.OBJLoader( manager );
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.position.set(xOff,yOff,zOff);
    object.rotation.x= xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale,scale,scale);
    object.parent = worldFrame;
    scene.add(object);

  }, onProgress, onError);
}

// LOAD WIZARD & WIZARD HAT
loadOBJ('obj/wizard.obj', wizardMaterial, 1.0, 0.0, 0.0, -8.0, 0.0, 0.0, 0.0);
loadOBJ('obj/hat.obj', wizardMaterial, 1.0, 0.0, 10.0, -8.0, 0.0, -1.0 * Math.PI/2, 0.0);

// CREATE MAGIC CIRCLE
// https://threejs.org/docs/#api/en/geometries/PlaneGeometry
var magicGeometry = new THREE.PlaneBufferGeometry(10.0, 10.0, 50.0, 50.0);
var magicCircle = new THREE.Mesh(magicGeometry, magicMaterial);
magicCircle.position.y = 0.1;
magicCircle.rotation.x = Math.PI / 2.0;
scene.add(magicCircle);
magicCircle.parent = worldFrame;

// CREATE MAGICAL ITEMS
// https://threejs.org/docs/#api/en/geometries/SphereGeometry
var sphereGeometry = new THREE.SphereGeometry(1.0, 32.0, 32.0);
var sphere = new THREE.Mesh(sphereGeometry, itemMaterial);
sphere.position.set(7.0, 1.0, 7.0);
sphere.scale.set(1.0, 1.0, 1.0);
sphere.parent = worldFrame;
scene.add(sphere);

// https://threejs.org/docs/#api/en/geometries/TorusGeometry
var torusGeometry = new THREE.TorusGeometry(0.9, 0.4, 10, 20);
var torus = new THREE.Mesh(torusGeometry, itemMaterial);
torus.position.set(10.0, 1.0, 10.0);
torus.scale.set(1.0, 1.0, 1.0);
torus.rotation.x = Math.PI / 2.0;
torus.parent = worldFrame;
scene.add(torus);

// https://threejs.org/docs/#api/en/geometries/CylinderGeometry
var pyramidGeometry = new THREE.CylinderGeometry(0.0, 1.0, 2.0, 4.0, 1.0);
var pyramid = new THREE.Mesh(pyramidGeometry, itemMaterial);
pyramid.position.set(11.0, 1.0, 6.0);
pyramid.scale.set(1.0, 1.0, 1.0);
pyramid.parent = worldFrame;
scene.add(pyramid);



// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W"))
    magicPosition.value.y -= 0.3;
  else if (keyboard.pressed("S"))
    magicPosition.value.y += 0.3;

  if (keyboard.pressed("A"))
    magicPosition.value.x -= 0.3;
  if (keyboard.pressed("D"))
    magicPosition.value.x += 0.3;
  else if(keyboard.pressed(" ") && flag.value === 1.0){
    flag.value = 0.0;
    setTimeout(function(){
      //magicCircleAnimation.value = 1.0 + Math.round(Math.random() * 2.0);  // picks a number between 1 and 3
      //find the closest object
      var distpyramid = distanceVector(magicPosition.value,pyramid.position);
      var distsphere = distanceVector(magicPosition.value,sphere.position);
      var disttorus = distanceVector(magicPosition.value,torus.position);
      console.log("circle:"+magicPosition.value.z);
      console.log("sphere:"+distsphere);
      console.log("pyramid:"+distpyramid);
      console.log("torus:"+disttorus);

      //eat time
      if(eatspit.value == 0.0){
        if(distsphere <= 2.0 || disttorus <= 2.0 || distpyramid <= 2.0 ){
          //eat sphere
          if(distsphere<=disttorus && distsphere<=distpyramid){
            objecttype.value == 0.0
            sphere.material = disappearingMaterial;
          }
          //eat pyramid
          else if(distpyramid<=disttorus && distpyramid<=distsphere){
            objecttype.value == 1.0
            pyramid.material = disappearingMaterial;
          }
          //eat torus
          else{
            objecttype.value == 2.0
            torus.material = disappearingMaterial;
          }
          eatspit.value = 1.0;
        }
        //nothing should be eaten
        else{
          objecttype.value == 3.0
        }


      }
      //spit time
      else{
        if(objecttype == 3.0){
          console.log("nothing to spit");
        }else{

        }

      }


      console.log(magicCircle.position);
      // if(magicCircleAnimation.value === 1.0){
      //   console.log("sphere");
      //   var sphere = new THREE.Mesh(sphereGeometry, itemMaterial);
      //   sphere.position.set(magicPosition.value.x,1.0,magicPosition.value.y); // to be updated
      //   sphere.scale.set(1.0, 1.0, 1.0);
      //   sphere.parent = worldFrame;
      //   scene.add(sphere);
      // }
      // else if(magicCircleAnimation.value === 2.0){
      //   console.log("torus");
      //   var torus = new THREE.Mesh(torusGeometry, itemMaterial);
      //   torus.position.set(magicPosition.value.x,1.0,magicPosition.value.y); // to be updated
      //   torus.scale.set(1.0, 1.0, 1.0);
      //   torus.rotation.x = Math.PI / 2.0;
      //   torus.parent = worldFrame;
      //   scene.add(torus);
      // }
      // else{
      //   console.log("pyramid");
      //   var pyramid = new THREE.Mesh(pyramidGeometry, itemMaterial);
      //   pyramid.position.set(magicPosition.value.x,1.0,magicPosition.value.y); // to be updated
      //   pyramid.scale.set(1.0, 1.0, 1.0);
      //   pyramid.parent = worldFrame;
      //   scene.add(pyramid);
      // }
      flag.value =1.0;
    },1000);

  }


  wizardMaterial.needsUpdate = true; // Tells three.js that some uniforms might have changed
  itemMaterial.needsUpdate = true;
  magicMaterial.needsUpdate = true;
}

// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  checkrotate();
  requestAnimationFrame(update); // Requests the next update call, this creates a loop
  renderer.render(scene, camera);
}

function checkrotate(){

}

function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - 6.0 - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy );
}

update();
