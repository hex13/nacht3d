class Manipulator {
    constructor(n3d, selector) {
        this.selector = selector;
        this.n3d = n3d;
    }
    update(params) {
        let current;
        this.selector.forEach(item => {
            if (item.isObject3D) {
                current = item;
            } else if (typeof item == 'number') {
                current = current.children[item];
            }
        });
        const updated = this.n3d.update(current, params);
    }
}

export function createThreeObject(THREE, params) {
    const create = (params) => createThreeObject(THREE, params);
    switch (params.kind) {
        case 'mesh': {
            const mesh = new THREE.Mesh();
            if (params.geometry) {
                mesh.geometry = create(params.geometry);
            }
            if (params.material) {
                mesh.material = create(params.material);
            }

            mesh.position.set(...params.position);
            return mesh;
        }
        case 'cube':
            return new THREE.BoxGeometry(...params.size);
        case 'sphere':
            return new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
        case 'material': {
            switch (params.materialKind) {
                case 'lambert':
                    return new THREE.MeshLambertMaterial({ color: new THREE.Color(...params.color) });
                case 'basic':
                    return new THREE.MeshBasicMaterial({ color: new THREE.Color(...params.color) });
            }
            break;
        }
        case 'scene': {
            const scene = new THREE.Scene();
            params.children.forEach(child => {
                scene.add(create(child));
            })
            return scene;
        }
    }
}
export function ThreeController(THREE) {
    return {
        create: (params, previousObject) => {
            if (previousObject) {
                params = {...previousObject.userData.nacht3d_params, ...params};
            }
            const object = createThreeObject(THREE, params);
            object.userData.nacht3d_params = params;
            return object;
        },
        updaters: {
            position: (object, v) => object.position.set(...v),
            color: (object, v) => object.color.setRGB(...v),
        },
        afterUpdate(object, params) {
            object.userData.nacht3d_params = {...object.userData.nacht3d_params, ...params};
        }
    };
}
export default class Nacht3D {
    constructor({ controller }) {
        this.controller = controller;
    }
    find(selector) {
        return new Manipulator(this, selector);
    }
    create(params) {
        return this.controller.create(params);
    }
    update(object, params) {
        const { updaters } = this.controller;
        for (const k in params) {
            if (Object.hasOwn(updaters, k)) {
                updaters[k](object, params[k]);
            } else return this.controller.create(params, object);
        }
        this.controller.afterUpdate(object, params);
        return object;
    }
};

export function Mesh(geometry, material, position) {
    return {
        kind: 'mesh',
        geometry,
        material,
        position,
    };
}

export function Cube(size = [1, 1, 1]) {
    return {
        kind: 'cube',
        size,
    };
}


export function Sphere(radius = 1, widthSegments, heightSegments) {
    return {
        kind: 'sphere',
        radius,
        widthSegments,
        heightSegments,
    };
}

export function Material(materialKind, color = [1, 1, 1]) {
    return {
        kind: 'material',
        materialKind,
        color,
    };
}

export function Scene(children) {
    return {
        kind: 'scene',
        children,
    };
}