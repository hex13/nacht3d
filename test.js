import test from 'node:test';
import assert from 'node:assert';

import * as THREE from 'three';
import Nacht3D, { Mesh, Cube, Sphere, Lambert, Scene } from './src/index.js';

function initTest() {
    return {
        n3d: new Nacht3D({
            libs: { THREE },
        }),
    }
}
test('Mesh()', () => {
    const { n3d } = initTest();
    const mesh = n3d.create(Mesh(null, null, [-10, -20, 30]));
    assert.strictEqual(mesh.isMesh, true);
    assert.strictEqual(!!mesh.geometry, true);
    assert.strictEqual(!!mesh.material, true);
    assert.deepStrictEqual(mesh.position, new THREE.Vector3(-10, -20, 30));
});

test('Cube()', () => {
    const { n3d } = initTest();
    const geom = n3d.create(Cube([2, 1, 0.5]));

    assert.strictEqual(geom.isBufferGeometry, true);
    assert.strictEqual(geom.type, 'BoxGeometry');
    assert.deepStrictEqual(geom.parameters, {
        width: 2,
        height: 1,
        depth: 0.5,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
    });
});

test('Sphere()', () => {
    const { n3d } = initTest();
    const geom = n3d.create(Sphere(3, 4, 5));

    assert.strictEqual(geom.isBufferGeometry, true);
    assert.strictEqual(geom.type, 'SphereGeometry');
    assert.strictEqual(geom.parameters.radius, 3);
    assert.strictEqual(geom.parameters.widthSegments, 4);
    assert.strictEqual(geom.parameters.heightSegments, 5);
});

test('Lambert()', () => {
    const { n3d } = initTest();
    const mat = n3d.create(Lambert());
    assert.strictEqual(mat.isMaterial, true);
    assert.strictEqual(mat.type, 'MeshLambertMaterial');
});

test('Scene()', () => {
    const { n3d } = initTest();
    const scene = n3d.create(Scene([
        Mesh(Cube([2, 3, 0.5]), Lambert(), [1, 2, 3]),
        Mesh(Cube([2.1, 3.1, 1.5]), Lambert(), [4, 5, 6]),
    ]));

    assert.strictEqual(scene.children.length, 2);
    assert.strictEqual(scene.children[0].isObject3D, true);
    assert.deepStrictEqual(scene.children[0].position, new THREE.Vector3(1, 2, 3));

    assert.strictEqual(scene.children[0].geometry.type, 'BoxGeometry');
    assert.deepStrictEqual(scene.children[0].geometry.parameters, {
        width: 2, height: 3, depth: 0.5, widthSegments: 1, heightSegments: 1, depthSegments: 1
    });

    assert.strictEqual(scene.children[1].isObject3D, true);
    assert.deepStrictEqual(scene.children[1].position, new THREE.Vector3(4, 5, 6));

    assert.strictEqual(scene.children[1].geometry.type, 'BoxGeometry');
    assert.deepStrictEqual(scene.children[1].geometry.parameters, {
        width: 2.1, height: 3.1, depth: 1.5, widthSegments: 1, heightSegments: 1, depthSegments: 1
    });

    assert.strictEqual(scene.children[0].material.type, 'MeshLambertMaterial');
    assert.strictEqual(scene.children[1].material.type, 'MeshLambertMaterial');

    assert.strictEqual(scene.type, 'Scene');
});

test('update position', () => {
    const { n3d } = initTest();
    const mesh = n3d.create(Mesh(null, null, [0, 0, 0]));
    assert.deepStrictEqual(mesh.position, new THREE.Vector3(0, 0, 0))
    const updatedMesh = n3d.update(mesh, {
        position: [3, 2.5, 1.5],
    });
    assert.strictEqual(updatedMesh, mesh);
    assert.deepStrictEqual(mesh.position, new THREE.Vector3(3, 2.5, 1.5))
});


test('update kind: should recreate object', () => {
    const { n3d } = initTest();
    let geometry = n3d.create(Cube());
    assert.strictEqual(geometry.type, 'BoxGeometry');

    const oldGeometry = geometry;
    geometry = n3d.update(geometry, {
        kind: 'sphere'
    });
    assert.notStrictEqual(oldGeometry, geometry);
    assert.strictEqual(geometry.type, 'SphereGeometry');
    assert.strictEqual('radius' in geometry.parameters, true);
});