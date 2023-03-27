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
            object = mesh;
            break;
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
            break;
        case 'renderer':
            object = new THREE.WebGLRenderer();
            break;
    }
    updateThreeObject(object, params);
    return object;
}

export function updateThreeObject(object, params) {
    if (params.position) object.position.set(...params.position);
    if (params.color) object.color.setRGB(...params.color);
}

export class StateManager {
    constructor(controller, resolveParams = x => x) {
        this.controller = controller || {
            create: () => {},
            update: () => {},
        };
        this.resolveParams = resolveParams;
    }
    create(params) {
        return this.update({state: {}, object: null}, params);
    }
    _update(entity, params) {
        Object.assign(entity.state, params);
        if (!entity.object) {
            entity.object = this.controller.create(params);
        }
        this.controller.update(entity, params);
        return entity;
    }
    update(entity, params) {
        params = this.resolveParams(params, entity.state);
        if (params && params[Symbol.asyncIterator]) {
            (async () => {
                for await (const patch of params) {
                    this._update(entity, patch);
                }
            })();
        }
        return this._update(entity, params);
    }
}

export class Resolver {
    async* resolve(params, prevState) {
        const resolvedParams = {};
        const propsToAwait = [];

        for (const k in params) {
            let v = params[k];
            if (typeof v == 'function') {
                v = v(prevState[k]);
                if (v && v[Symbol.asyncIterator]) {
                    propsToAwait.push([k, v]);
                    continue;
                }
            }
            resolvedParams[k] = v;
        }

        if (Object.keys(resolvedParams).length) {
            yield resolvedParams;
        }

        for (const [k, gen] of propsToAwait) {
            for await (const value of gen) {
                yield {[k]:value}
            }
        }
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

export function Renderer() {
    return {
        kind: 'renderer',
    };
}

