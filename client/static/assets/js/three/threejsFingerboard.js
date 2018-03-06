"use strict";
if (!Detector.webgl) Detector.addGetWebGLMessage();

var baseURL = '../static/assets';

var camera;
var controls;
var scene;
var renderer;

var meshDistance;
var fbGroup;
var linesGroup;

var lines = [];
var pos = {
    lineFir: [],
    lineSec: [],
    ann: []
};

var fbYpos = -110;

var selectors = ['.sloper30', '.sloper20', '.jugL', '.jugC',
    '.fingPock2', '.fingPock3', '.fingPock4',
    '.fingCrimp4', '.fingCrimp3', '.fingCrimp2'
];

function fingerboard3D() {
    init();
    animate();
}

// UI elements show hide

$('#ann').hide();
$('.showOrNot').on('click', hideShow);
$('.show2d3d').on('click', show2d3d);
$('#ann>div').on('click', displayAnnText);
$('.ann-text').on('click', function() { $(this).hide(); } );

function hideShow() {
    var text = $('.showOrNot').text();
    $('.showOrNot').text(text == 'Show Annotaions' ? 'Hide Annotaions' : 'Show Annotaions');
    $('#ann').toggle();
    linesGroup.visible = linesGroup.visible ? false : true;
}

function show2d3d() {
    var text2 = $('.show2d3d').text();
    $('.show2d3d').text(text2 == 'Show image' ? 'Show 3D' : 'Show image');
    $('#canvasContainer>img').toggle();
    $('.showOrNot').toggle();
    $('#ann').toggle();
    fbGroup.visible = fbGroup.visible ? false : true;
}

function displayAnnText() {
    $('.ann-text').toggle();
    var elClass = this.className;
    console.log(elClass);
    console.log(typeof elClass);
}

// UI elements show hide END

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, 5 / 3, 1, 2000); //5/3 ratio corresponds to the 0.6 width/height canvas container padding
    scene.add(camera);
    camera.position.set(0, 0, 1020);

    //RENDER
    renderer = createRenderer(0x222222, 0.1);
    var parent = document.getElementById('canvasContainer');
    parent.appendChild(renderer.domElement);

    // Empty Group
    fbGroup = createfbGroup(0, fbYpos, 0);
    meshDistance = camera.position.distanceTo(fbGroup.position);

    //
    linesGroup = new THREE.Object3D;
    fbGroup.add(linesGroup);

    if (screen.width > 992) {
        // lines
        pos.lineFir = [
            [-165, 134, 34], // 30 sloper
            [-83, 141, 34], //20 sloper
            [0, 68, 55], // large Jug
            [0, 24, 40], // central Jug
            [-91, 68, 55], // 2 Finger Pocket
            [-161, 68, 55], // 3 Finger Pocket
            [-253, 68, 55], // 4 Finger Pocket
            [-103, 25, 40], // 2 Finger Cripm
            [-188, 25, 40], // 3 Finger Cripm
            [-270, 25, 40] // 4 Finger Cripm
        ];
        var difference = [10, 10, 20];
        for (var i = 0; i < pos.lineFir.length; i++) {
            var d0 = pos.lineFir[i][0] + difference[0];
            var d1 = pos.lineFir[i][1] + difference[1];
            var d2 = pos.lineFir[i][2] + difference[2];

            pos.lineSec.push([d0, d1, d2]);
            pos.ann.push([d0, d1 + fbYpos, d2]);

            lines[i] = createLine(pos.lineFir[i], pos.lineSec[i]);
        }
    } else { linesGroup.visible = false }

    //MATERIALS
    var fingerboardMat = createFingerBoardMaterial();

    //LIGHTS
    createLights();

    //LOAD FINGERBOARD
    var fingerb = loadObject(baseURL + '/obj/fingerboard2.obj', fingerboardMat, fbGroup);

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //LOADER
    loadingScreen(fbGroup);

}

// end of init()



// FUNCTIONS

//Materials and Textures
function repeatTex(mapName, repeat) {
    mapName.wrapS = THREE.RepeatWrapping;
    mapName.wrapT = THREE.RepeatWrapping;
    mapName.repeat.set(repeat, repeat);
}

function loadTextures() {
    var maps = {
        diffTex: new THREE.TextureLoader().load(baseURL + '/tex/WornWood1_1024_albedo2.png'),
        aoTex: new THREE.TextureLoader().load(baseURL + '/tex/WornWood1_1024_ao.png'),
        nrmTex: new THREE.TextureLoader().load(baseURL + '/tex/WornWood1_1024_normal.png'),
        roughtTex: new THREE.TextureLoader().load(baseURL + '/tex/WornWood1_1024_roughness.png'),
        //  backgroundTex: new THREE.TextureLoader().load(baseURL + '/tex/background.jpg'),
    }
    repeatTex(maps.diffTex, 2);
    repeatTex(maps.aoTex, 2);
    repeatTex(maps.nrmTex, 2);
    repeatTex(maps.roughtTex, 2);
    maps.envCubeMap = new THREE.CubeTextureLoader()
        .setPath(baseURL + '/tex/cubemap/')
        .load([
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg',
        ]);
    return maps;
}

function createFingerBoardMaterial() {
    var textureContainer = loadTextures();
    var material = new THREE.MeshStandardMaterial({
        aoMap: textureContainer.aoTex,
        color: 0xe5d3cc,
        envMap: textureContainer.envCubeMap,
        map: textureContainer.diffTex,
        normalMap: textureContainer.nrmTex,
        normalScale: new THREE.Vector3(0.2, 0.2),
        metalness: 0,
        roughness: 1,
        // roughnessMap: textureContainer.roughtTex
    });

    return material;
}

function createfbGroup(x, y, z) {
    var fbGroup = new THREE.Object3D;
    fbGroup.name = 'fingerboard group';
    fbGroup.position.set(x, y, z);
    fbGroup.rotation.set(0, 0, 0);
    fbGroup.visible = false;
    scene.add(fbGroup);

    return fbGroup;
}

// Line 
function createLine(fp, sp) {
    var material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.4, linecap: 'round' });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(fp[0], fp[1], fp[2]));
    geometry.vertices.push(new THREE.Vector3(sp[0], sp[1], sp[2]));
    var line = new THREE.Line(geometry, material);
    line.visible = false;
    linesGroup.add(line);

    return line;
}

//Function LIGHTS
function createLights() {
    var ambLight = new THREE.AmbientLight(0x404040); // soft white light
    ambLight.intensity = 0.8;
    // scene.add(ambLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-400, 100, 600);
    spotLight.rotation.set((10 * Math.PI / 180), 0, 0);
    // spotLight.angle = 1.2;
    // spotLight.penumbra = 1;
    spotLight.intensity = 1;
    scene.add(spotLight);

    var spotLight2 = new THREE.SpotLight(0xffffff);
    spotLight2.position.set(0, 100, -600);
    spotLight2.intensity = 0.7;
    scene.add(spotLight2);

    // // Helper
    // var spotLightHelper = new THREE.SpotLightHelper(spotLight2);
    // scene.add(spotLightHelper);

    var hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.4);
    scene.add(hemLight);
}

function loadObject(objpath, material, parent) {
    createFingerBoardMaterial();
    var loader = new THREE.OBJLoader();
    loader.load(objpath,
        function(object) {
            object.name = 'fingerboard';
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            parent.add(object);
        },
        function(xhr) {
            var loadPercent = Math.round(xhr.loaded / xhr.total * 100);
            $('.percent').text(loadPercent);
        },
        function(error) {
            console.log('An error happened');
        }
    );
}

function loadingScreen(fbGroup) {
    THREE.DefaultLoadingManager.onStart = function() {
        $('#loader').show();
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        $('.showOrNot').show();
        $('.show2d3d').show();
        $('#ann').show();
        $('#loader').hide();
        $('#canvasContainer>img').hide(300);
        $('canvas').css('cursor', 'crosshair');
        fbGroup.visible = true;
    };
}

//FUNCTION FOR CREATING RENDERER
function createRenderer(clearColour, alpha) {
    var myRenderer;
    myRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    myRenderer.shadowMap.enabled = true; //enabling shadow maps in the renderer
    myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    myRenderer.setClearColor(clearColour, alpha);
    myRenderer.setSize(window.innerWidth, window.innerHeight);

    return myRenderer;
}

function updateScreenPosition(annPos, meshDist, selects) {
    var ann;
    var canvas = renderer.domElement;

    annPos.map((p, i) => {
        if (lines.length > 0) {
            var vec = new THREE.Vector3(p[0], p[1], p[2]);
            var vec2 = new THREE.Vector3(p[0], p[1] - 27, p[2]);
            var spritesBehindObject;

            // Annotation position
            vec.project(camera);
            vec.x = Math.round((0.5 + vec.x / 2) * (canvas.clientWidth / window.devicePixelRatio));
            vec.y = Math.round((0.5 - vec.y / 2) * (canvas.clientHeight / window.devicePixelRatio)); //changed from canvas.height to canvas.clienntHeight

            ann = document.querySelector(selects[i]);
            ann.style.top = `${vec.y}px`;
            ann.style.left = `${vec.x}px`;

            // opacity
            var spriteDistance = camera.position.distanceTo(vec2);
            spritesBehindObject = spriteDistance > meshDist;
            ann.style.opacity = spritesBehindObject ? 0.1 : 1;

            lines[i].visible = spritesBehindObject ? false : true;
        }
    });
}


function animate() {
    window.requestAnimationFrame(animate);
    render(controls, scene, camera, pos.ann, meshDistance, selectors);
}

function render(ctrls, sc, cam, ann, meshDist, selects) {
    ctrls.update(); // moved from animate fn
    renderer.render(sc, cam);
    updateScreenPosition(ann, meshDist, selects);
}