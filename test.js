import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import Nacht3D, { Mesh, Cube, Sphere, Scene, Material, ThreeController, StateManager, Resolver,
    createThreeObject, updateThreeObject,
} from './src/index.js';

function initTest() {
    return {
        n3d: new Nacht3D({
            controller: new ThreeController(THREE),
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

test('lambert material', () => {
    const { n3d } = initTest();
    const mat = n3d.create(Material('lambert', [0.91, 0.5, 0.2]));
    assert.strictEqual(mat.isMaterial, true);
    assert.strictEqual(mat.type, 'MeshLambertMaterial');
    assert.deepStrictEqual(mat.color, new THREE.Color(0.91, 0.5, 0.2));
});

test('basic material', () => {
    const { n3d } = initTest();
    const mat = n3d.create(Material('basic', [0.91, 0.5, 0.2]));
    assert.strictEqual(mat.isMaterial, true);
    assert.strictEqual(mat.type, 'MeshBasicMaterial');
    assert.deepStrictEqual(mat.color, new THREE.Color(0.91, 0.5, 0.2));
});

test('Scene()', () => {
    const { n3d } = initTest();
    const scene = n3d.create(Scene([
        Mesh(Cube([2, 3, 0.5]), Material('lambert'), [1, 2, 3]),
        Mesh(Cube([2.1, 3.1, 1.5]), Material('lambert'), [4, 5, 6]),
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

function createTestController() {
    return {
        create(params, previousObject) {
            const obj = {};
            if (previousObject) {
                Object.assign(obj, previousObject);
            }
            Object.assign(obj, params);
            return obj;
        }, updaters: {
            counter: (object, value) => {
                object.counter = value;
            }
        },
        afterUpdate() {

        },
        getParams(object) {
            return object;
        }
    };
}

test('update (general)', () => {
    let current;
    const n3d = new Nacht3D({
        controller: createTestController(),
    });

    const original = n3d.create({counter: 100, kind: 'firstCounter'});
    assert.deepStrictEqual(original, {counter: 100, kind: 'firstCounter'});

    current = n3d.update(original, {counter: 19});
    assert.strictEqual(current, original);
    assert.deepStrictEqual(current, {counter: 19, kind: 'firstCounter'});

    current = n3d.update(current, {kind: 'secondCounter'});
    assert.notStrictEqual(current, original);
    assert.deepStrictEqual(current, {counter: 19, kind: 'secondCounter'});

});

test('update (with functions)', () => {
    let current;
    const n3d = new Nacht3D({
        controller: createTestController(),
    });
    const original = n3d.create({counter: 100});
    assert.deepStrictEqual(original, {counter: 100});
    current = n3d.update(original, {counter: (v) => {
        console.log("XXXXXX", v);
        return v + 123;
    }});
    assert.deepStrictEqual(current, {counter: 223});
});


// this is new implementation which will replace current Nacht3D class
test('StateManager', () => {
    const stateManager = new StateManager();
    let entity = stateManager.create({foo: 9});
    assert.deepStrictEqual(entity, {
        object: undefined,
        state: {foo: 9},
    });
    entity = stateManager.update(entity, {foo: 10});
    assert.deepStrictEqual(entity, {
        object: undefined,
        state: {foo: 10},
    });
    entity = stateManager.update(entity, {city: 'Warsaw'});
    assert.deepStrictEqual(entity, {
        object: undefined,
        state: {foo: 10, city: 'Warsaw'},
    });
});


test('StateManager with controller', () => {
    let events = [];
    const ctrl = {
        create(params) {
            return {kind: params.kind, position: [params.x, params.y]};
        },
        update(entity, params) {
            entity.object = this.create(entity.state);
        }
    };
    const stateManager = new StateManager(ctrl);
    let entity = stateManager.create({kind: 'cat', x: 10, y: 20});
    assert.deepStrictEqual(entity, {
        object: {kind: 'cat', position: [10, 20]},
        state: {kind: 'cat', x: 10, y: 20},
    });

    entity = stateManager.update(entity, {x: 11, y: 22});
    assert.deepStrictEqual(entity, {
        object: {kind: 'cat', position: [11, 22]},
        state: {kind: 'cat', x: 11, y: 22},
    });
});

test('StateManager with resolver', () => {
    const stateManager = new StateManager(null, (params, prevState) => {
        return Object.fromEntries(Object.entries(params).map(([k, v]) => [k + '!', v + 10]));
    });
    const entity = stateManager.create({a: 11, b: 3});
    assert.deepStrictEqual(entity, {
        object: undefined,
        state: {
            'a!': 21,
            'b!': 13,
        },
    });

    const updated = stateManager.update(entity, {a: 100, b: 200});
    assert.deepStrictEqual(updated, {
        object: undefined,
        state: {
            'a!': 110,
            'b!': 210,
        },
    });
});

test('StateManager with resolver - should pass correct arguments to resolver', () => {
    const events = [];
    const stateManager = new StateManager(null, (params, prevState) => {
        events.push(['resolve', params, prevState === undefined? undefined : {...prevState} ]);
        return params;
    });
    const entity = stateManager.create({a: 11, b: 3});
    stateManager.update(entity, {a: 100, b: 200});
    assert.deepStrictEqual(events, [
        ['resolve', {a: 11, b: 3}, {}],
        ['resolve', {a: 100, b: 200}, {a: 11, b: 3}],
    ]);
});



test('StateManager with resolver - async generators', (done) => {
    const stateManager = new StateManager(null, async function* (params, prevState) {
        for (const k in params) {
            yield {[k]: params[k]}
        }
    });
    const entity = stateManager.create({c: 12, d: 13});

    stateManager.update(entity, {a: 10, b: 11});
    setTimeout(() => {
        assert.deepStrictEqual(entity.state, {
            a: 10,
            b: 11,
            c: 12,
            d: 13,
        });
    }, 0);
});

async function asyncGenToArray(it) {
    const result = [];
    for await (const v of it) {
        result.push(v);
    }
    return result;
}

test('asyncGenToArray helper', async () => {
    let values;
    async function* foo() {
        yield 1;
        yield 20;
        yield 31;
    }
    values = await asyncGenToArray(foo());
    assert.deepStrictEqual(values, [1, 20, 31]);
});


test('Resolver', async () => {
    const sleep = t => new Promise(r => { setTimeout(r, t); });
    const checkValues = async (params, prevState, expectedValues) => {
        assert.deepStrictEqual(await asyncGenToArray(resolver.resolve(params, prevState)), expectedValues);
    };
    const resolver = new Resolver();
    let state;
    const createState = () => ({
        abc: 'kotek',
        def: 'wlazł na płotek',
        counter: 1,
    });
    state = createState();

    await checkValues({}, state, [{}])

    await checkValues({abc: 'piesek'}, state, [{abc: 'piesek'}])

    await checkValues({
        def: () => 'zrobił hau',
        counter: () => 100,
    }, state, [{def: 'zrobił hau', counter: 100}]);

    await checkValues({
        counter: (x) => x + 10,
    }, state, [{counter: 11}]);

    assert.deepStrictEqual(state, createState());
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

test('update color of material', () => {
    const { n3d } = initTest();
    const expectedColor = [0.6, 0.7, 0.8];
    const material = n3d.create(Material('lambert'));
    assert.notDeepStrictEqual(material.color, new THREE.Color(...expectedColor));
    const updated = n3d.update(material, {
        color: [...expectedColor],
    });
    assert.strictEqual(updated, material);
    assert.deepStrictEqual(updated.color, new THREE.Color(...expectedColor));
});


test('update when should recreate object', () => {
    const { n3d } = initTest();
    {
        let geometry = n3d.create(Cube());
        assert.strictEqual(geometry.type, 'BoxGeometry');

        const oldGeometry = geometry;
        geometry = n3d.update(geometry, {
            kind: 'sphere'
        });
        assert.notStrictEqual(oldGeometry, geometry);
        assert.strictEqual(geometry.type, 'SphereGeometry');
        assert.strictEqual('radius' in geometry.parameters, true);
    }
    {
        const material = n3d.create(Material('basic', [0.5, 0.1, 0.2]));
        assert.strictEqual(material.type, 'MeshBasicMaterial');
        assert.deepStrictEqual(material.color, new THREE.Color(0.5, 0.1, 0.2));

        n3d.update(material, {color: [0.7, 0.3, 0.12]}); // for checking if params are updated after update()

        const newMaterial = n3d.update(material, {materialKind: 'lambert'});
        assert.notStrictEqual(material, newMaterial);
        assert.strictEqual(newMaterial.type, 'MeshLambertMaterial');
        assert.deepStrictEqual(material.color, new THREE.Color(0.7, 0.3, 0.12));

    }

});

test('createThreeObject(), camera', () => {
    const camera = createThreeObject(THREE, {
        kind: 'camera',
        fov: 46,
        aspect: 1.5,
        position: [1, 2, 3],
    });

    assert.strictEqual(camera instanceof THREE.PerspectiveCamera, true);
    assert.strictEqual(camera.fov, 46);
    assert.strictEqual(camera.aspect, 1.5);
    assert.deepStrictEqual(camera.position, new THREE.Vector3(1, 2, 3));
});

test('updateThreeObject(), empty update params', () => {
    const object = {
        position: new THREE.Vector3(9, 8, 7),
        color: new THREE.Color(0.2, 0.6, 0.8),
    }
    updateThreeObject(object, {});
    assert.deepStrictEqual(object.position, new THREE.Vector3(9, 8, 7));
    assert.deepStrictEqual(object.color, new THREE.Color(0.2, 0.6, 0.8));
});


test('updateThreeObject(), position', () => {
    const object = new THREE.Mesh();
    updateThreeObject(object, {
        position: [1.2, 2.3, 4.5],
    });
    assert.deepStrictEqual(object.position, new THREE.Vector3(1.2, 2.3, 4.5));
});


test('updateThreeObject(), color', () => {
    const object = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.6, 0.7, 0.8),
    });
    updateThreeObject(object, {
        color: [0.3, 0.2, 0.1],
    });
    assert.deepStrictEqual(object.color, new THREE.Color(0.3, 0.2, 0.1));
});
