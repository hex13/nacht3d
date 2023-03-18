import test from 'node:test';
import assert from 'node:assert';

import * as THREE from 'three';
import Nacht3D, { Mesh, Cube, Lambert } from './src/index.js';

function initTest() {
    return {
        n3d: new Nacht3D({
            libs: { THREE },
        }),
    }
}
test('Mesh()', () => {
    const { n3d } = initTest();
    const mesh = n3d.create(Mesh());
    assert.strictEqual(mesh.isMesh, true);
    assert.strictEqual(!!mesh.geometry, true);
    assert.strictEqual(!!mesh.material, true);
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

test('Lambert()', () => {
    const { n3d } = initTest();
    const mat = n3d.create(Lambert());
    assert.strictEqual(mat.isMaterial, true);
    assert.strictEqual(mat.type, 'MeshLambertMaterial');
});