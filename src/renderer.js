"use strict";

var THREE = require('three');
THREE.TrackballControls = require('three.trackball');

var Renderer = function(el) {

    var width = window.innerWidth;
    var height = window.innerHeight;

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.001, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(width, height);
    el.appendChild( renderer.domElement );

    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    var scene = new THREE.Scene();

    this.material = new THREE.MeshBasicMaterial({
        color: '#fff',
        side: THREE.DoubleSide,
        wireframe: true
    });

    var axisHelper = new THREE.AxisHelper( 1 );
    scene.add( axisHelper );

    function render() {
        renderer.render(scene, camera);
    }

    function animate() {
        render();
        controls.update();
        requestAnimationFrame(animate);
    }

    function onWindowResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    var projectId = window.location;

    function storeControls() {
        var state = JSON.stringify({
            target: controls.target,
            position: controls.object.position,
            up: controls.object.up
        })
        sessionStorage.setItem(projectId + 'threecontrols', state);
    }

    function restoreControls() {
        var state = sessionStorage.getItem(projectId + 'threecontrols');
        state = JSON.parse(state);
        // state = false;
        if (state) {
            controls.target0.copy(state.target);
            controls.position0.copy(state.position);
            controls.up0.copy(state.up);
            controls.reset();    
        }
    }

    controls.addEventListener('change', function() {
        render();
        storeControls();
    });

    window.addEventListener('resize', onWindowResize, false);
    restoreControls();
    animate();

    this.sections = [];
    this.scene = scene;
};

Renderer.prototype = {

    startModel: function() {
        this.sections.forEach(function(section) {
            this.scene.remove(section);
        }, this);
    },

    addSection: function(vertices, faces) {
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array( faces.length * 3 * 3 );
        var f, v1, v2, v3;

        for (var i = 0; i < faces.length; ++i) {
            f = faces[i];
            v1 = vertices[ f[0] ];
            v2 = vertices[ f[1] ];
            v3 = vertices[ f[2] ];

            positions[ (i * 9) + 0 ] = v1[0];
            positions[ (i * 9) + 1 ] = v1[1];
            positions[ (i * 9) + 2 ] = v1[2];
            positions[ (i * 9) + 3 ] = v2[0];
            positions[ (i * 9) + 4 ] = v2[1];
            positions[ (i * 9) + 5 ] = v2[2];
            positions[ (i * 9) + 6 ] = v3[0];
            positions[ (i * 9) + 7 ] = v3[1];
            positions[ (i * 9) + 8 ] = v3[2];
        }

        var positionBuffer = new THREE.BufferAttribute( positions, 3 );
        geometry.addAttribute( 'position', positionBuffer );
        var obj = new THREE.Mesh(geometry, this.material);
        this.sections.push(obj);
        this.scene.add(obj);
    }
};

module.exports = Renderer;
