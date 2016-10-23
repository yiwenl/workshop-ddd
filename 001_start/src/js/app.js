import '../scss/global.scss';
import alfrid, { GL } from 'alfrid';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';

import vs from '../shaders/raymarching.vert';
import fs from '../shaders/raymarching.frag';

const assets = [
	// { id:'noise', url:'assets/img/noise.jpg' },
];

const params = {
	fov:1
};

let shader, mesh, globalTime = Math.random() * 10000, stats, orbControl;
let mouseX = 0;
let mouseY = 0;

window.addEventListener('DOMContentLoaded', _init);

function _init() {
	console.log('Init project');

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		const loader = new AssetsLoader({assets:assets})
		.on('error', (error)=>{console.log('Error :', error);})
		.on('progress', (p) => {document.body.querySelector('.Loading-Bar').style.width = `${(p * 100)}%`;})
		.on('complete', _onImageLoaded)
		.start();

	} else {
		_init3D();
	}


	window.addEventListener('mousemove', (e) => {
		mouseX = (e.clientX/window.innerWidth - 0.5) * 2.0;
		mouseY = (e.clientY/window.innerHeight - 0.5) * 2.0;
	});
	window.addEventListener('resize', resize);
}


function _onImageLoaded(o) {
	//	ASSETS
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}




function _init3D() {
	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	window.gui = new dat.GUI({ width:300 });
	gui.add(params, 'fov', 0.01, 2.0);

	//	INIT MESH
	mesh = alfrid.Geom.bigTriangle();

	//	INIT shader
	shader = new alfrid.GLShader(vs, fs);

	//	Orbital Control
	orbControl = new alfrid.OrbitalControl(null, window, 8);
	orbControl.rx.value = .8;

	//	LOOP RENDERING
	alfrid.Scheduler.addEF(() => loop());

	//	STATS
	stats = new Stats();
	document.body.appendChild(stats.domElement);

	resize();
}


function loop() {
	GL.clear(0, 0, 0, 0);
	globalTime += 0.01;

	shader.bind();
	shader.uniform("uGlobalTime", "float", globalTime);
	shader.uniform("uMouse", "vec2", [mouseX, mouseY]);
	shader.uniform("uAspectRatio", "float", GL.aspectRatio);
	shader.uniform("uFOV", "float", params.fov);
	shader.uniform("uAngles", "vec2", [orbControl.rx.value, orbControl.ry.value - Math.PI/2]);
	shader.uniform("uRadius", "float", orbControl.radius.value);
	GL.draw(mesh);

	stats.update();
}

function resize() {
	const width = Math.min(window.innerWidth, window.innerHeight, 500);
	const height = width;

	GL.canvas.style.width = `${width}px`;
	GL.canvas.style.height = `${height}px`;
	GL.canvas.style.top = `${(window.innerHeight - height)/2}px`;
	GL.canvas.style.left = `${(window.innerWidth - width)/2}px`;

	GL.setSize(width, height);
}