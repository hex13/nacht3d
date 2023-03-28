import * as THREE from 'three';
import {StateManager, Scene, Material, geometries, Mesh, createThreeObject, Resolver, Renderer } from '../src/index';
const Box = geometries.Cube;

const container = document.getElementById('app');
const renderer = createThreeObject(THREE, Renderer());
const [w, h] = [640, 480];
renderer.setSize(w, h);

container.append(renderer.domElement);
const resolver = new Resolver();

const scene = new THREE.Scene();

const stateManager = new StateManager({
    create(params) {
        return createThreeObject(THREE, params);
    },
    update(entity, params) {
        const { object } = entity;
        if (params.position) {
            object.position.set(...params.position);
        }
        if (params.color) {
            object.color.setRGB(...params.color);
        }
    },
}, resolver.resolve);

const camera = stateManager.create({kind: 'camera', fov: 45, aspect: w/h, position: [0, 0, 10]});

const sleep = t => new Promise(r => { setTimeout(r, t)});

const mesh = stateManager.create(
    Mesh(Box({}), Material('basic', [0.7, 0.2, 1.0]), async function *() {
        let x = 0, y = 0, z = 0;
        while (true) {
            await sleep(200);
            x += 0.1;
            yield [x, y, z];
            await sleep(50);
            y += 0.1;
            yield [x, y, z];
        }
    })
)

setTimeout(() => {
    scene.add(mesh.object);
    window.scene = scene; // for Cypress tests
    setInterval(() => {
        renderer.render(scene, camera.object);
    }, 16);
}, 100);




