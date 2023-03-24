export function createThreeObject(THREE, params) {
    const create = (params) => createThreeObject(THREE, params);
    let object;
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
        case 'camera':
            object = new THREE.PerspectiveCamera(params.fov, params.aspect);
    }
    updateThreeObject(object, params);
    return object;
}

export function updateThreeObject(object, params) {
    if (params.position) object.position.set(...params.position);
    if (params.color) object.color.setRGB(...params.color);
}

export function ThreeController(THREE) {
    return {
        getParams: object => {
            return object.userData.nacht3d_params || {};
        },
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
    resolveValue(valueDescription, previousValue) {
        if (typeof valueDescription == 'function') {
            return valueDescription(previousValue);
        }
        return valueDescription;
    }
    create(params) {
        return this.controller.create(params);
    }
    update(object, params) {
        const { updaters } = this.controller;
        for (const k in params) {
            if (Object.hasOwn(updaters, k)) {
                const value = this.resolveValue(params[k], this.controller.getParams(object)[k]);
                updaters[k](object, value);
            } else return this.controller.create(params, object);
        }
        this.controller.afterUpdate(object, params);
        return object;
    }
};

export class StateManager {
    constructor(controller, resolveParams = x => x) {
        this.controller = controller || {
            create: () => {},
            update: () => {},
        };
        this.resolveParams = resolveParams;
    }
    create(params) {
        params = this.resolveParams(params);
        return {
            state: {...params},
            object: this.controller.create(params),
        }
    }
    update(entity, params) {
        params = this.resolveParams(params, entity.state);
        Object.assign(entity.state, params);
        this.controller.update(entity, params);
        return entity;
    }
}

export class Resolver {
    resolve(params, prevState) {
        const resolvedParams = {};
        for (const k in params) {
            let v = params[k];
            if (typeof v == 'function') {
                v = v(prevState[k]);
            }
            resolvedParams[k] = v;
        }
        return resolvedParams;
    }
}

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