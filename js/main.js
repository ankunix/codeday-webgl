(function() {
  var clock;
  var scene, camera, renderer;
  var geometry, material, mesh;
  var havePointerLock = checkForPointerLock();
  var controls, controlsEnabled;

  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      canJump;

  var velocity = new THREE.Vector3();
  var footStepSfx = new Audio('/sfx/footstep.wav');
  var ambienceSfx = new Audio('/sfx/ambience.wav');
  var hemisphereLight, spotLight, spotLight2, spotLight3, spotLight4; 

  ambienceSfx.preload = 'auto';
  ambienceSfx.loop = true;

  init();
  animate();

  function init() {
    initControls();
    initPointerLock();

    ambienceSfx.play();
    footStepSfx.preload = 'auto';
    //footStepSfx.loop = true;

    clock = new THREE.Clock();

    scene = new THREE.Scene();    //scene.fog = new THREE.Fog(0xb2e1f2, 0, 750);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 10;
    camera.position.x = 50; 

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // Cube
    var plane, plane2, plane3, plane4, ceiling; 
    var cube = new THREE.BoxGeometry(100, 10, 10); 

    plane = new THREE.PlaneGeometry(500, 200); 
    plane2 = new THREE.PlaneGeometry(500, 200); 
    plane3 = new THREE.PlaneGeometry(500, 200); 
    plane4 = new THREE.PlaneGeometry(500, 200); 
    ceiling = new THREE.PlaneGeometry(500, 500); 

    var material = new THREE.MeshLambertMaterial({
       color : 0x33ff55
     })
    var material2 = new THREE.MeshLambertMaterial({
      color : 0x00aa33 
    })

    plane.applyMatrix(new THREE.Matrix4().makeTranslation(0, 100, 250)); 
    plane2.applyMatrix(new THREE.Matrix4().makeTranslation(0, 100, -250));

    plane3.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI /2));
    plane3.applyMatrix(new THREE.Matrix4().makeTranslation(250, 100, 0));
    
    plane4.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 2)); 
    plane4.applyMatrix(new THREE.Matrix4().makeTranslation(-250, 100, 0));

    ceiling.applyMatrix(new THREE.Matrix4().makeRotationX( -Math.PI/2));
    ceiling.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI)); 
    ceiling.applyMatrix(new THREE.Matrix4().makeTranslation(0, 200, 0)); 

     var mesh = new THREE.Mesh(plane, material); 
     var mesh2 = new THREE.Mesh(plane2, material); 
     var mesh3 = new THREE.Mesh(plane3, material2); 
     var mesh4 = new THREE.Mesh(plane4, material);
     var meshCeiling = new THREE.Mesh(ceiling, material); 
     var cubeMesh = new THREE.Mesh(cube, material2); 

    mesh.material.side = THREE.DoubleSide;
    mesh2.material.side = THREE.DoubleSide;
    mesh3.material.side = THREE.DoubleSide; 
    mesh4.material.side = THREE.DoubleSide; 

    //Let there be light 
    hemisphereLight = new THREE.HemisphereLight(0xffe5bb, 0xFFBF00, 0.2); 
    hemisphereLight.position.set(0, 10, 0); 
    spotLight = new THREE.SpotLight(0xffffff, 10, 200, 10, 6); 
    spotLight.position.set (0, 100, 230); 
    var spotTarget = new THREE.Object3D(); 
    spotTarget.position.set(0, 100, 250); 
    spotLight.target = spotTarget; 
    scene.add(spotTarget); 

    scene.add(mesh);
    scene.add(mesh2);
    scene.add(mesh3);
    scene.add(mesh4); 
    scene.add(meshCeiling);
    scene.add(cubeMesh)
    
    //Light the scene
    scene.add(hemisphereLight);
    scene.add(spotLight);
    scene.add(new THREE.PointLightHelper(spotLight, 1)); 
    // floor
   scene.add(createFloor());

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xb2e1f2);
    document.body.appendChild(renderer.domElement);
  }

  function animate() {
    requestAnimationFrame(animate);
    updateControls();
    renderer.render(scene, camera);
  }

  function createFloor() {
    geometry = new THREE.PlaneGeometry(500, 500, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

/*  var texture = THREE.ImageUtils.loadTexture('textures/floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(64, 64);*/

    material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    return new THREE.Mesh(geometry, material);
  }

  function checkForPointerLock() {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  }
  
  function initPointerLock() {
    var element = document.body;
    if (havePointerLock) {
      var pointerlockchange = function (event) {
        if (document.pointerLockElement === element || 
            document.mozPointerLockElement === element || 
            document.webkitPointerLockElement === element) {
          controlsEnabled = true;
          controls.enabled = true;
        } else {
          controls.enabled = false;
        }
      };

      var pointerlockerror = function (event) {
        element.innerHTML = 'PointerLock Error';
      };

      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      var requestPointerLock = function(event) {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      };

      element.addEventListener('click', requestPointerLock, false);
    } else {
      element.innerHTML = 'Bad browser; No pointer lock';
    }
  }
  
  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true; 
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 32: // space
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  }

  function onKeyUp(e) {
    switch(e.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }
  }

  function initControls() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
  }

  function updateControls() {
    if (controlsEnabled) {
      var delta = clock.getDelta();
      var walkingSpeed = 1000.0;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta;

      if (moveForward) velocity.z -= walkingSpeed * delta;
      if (moveBackward) velocity.z += walkingSpeed * delta;

      if (moveLeft) velocity.x -= walkingSpeed * delta;
      if (moveRight) velocity.x += walkingSpeed * delta;

      if (moveForward || moveBackward || moveLeft || moveRight) {
        footStepSfx.play();
      } 

      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }

      //Collisions 
      if (controls.getObject().position.x >= 240) {
        velocity.x = 0; 
        controls.getObject().position.x = 240;
      } else if (controls.getObject().position.x <= -240) {
        velocity.x = 0; 
        controls.getObject().position.x = -240; 
      }
    }
  }
})();



