export default class Nacht3D {
    constructor({ libs }) {
        this.libs = libs;
    }
    create(params) {
        const { THREE } = this.libs;
        switch (params.kind) {
            case 'mesh': {
                const mesh = new THREE.Mesh();
                if (params.geometry) {
                    mesh.geometry = this.create(params.geometry);
                }
                if (params.material) {
                    mesh.material = this.create(params.material);
                }

                mesh.position.set(...params.position);
                return mesh;
            }
            case 'cube':
                return new THREE.BoxGeometry(...params.size);
            case 'sphere':
                return new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
            case 'lambert':
                return new THREE.MeshLambertMaterial();
            case 'scene': {
                const scene = new THREE.Scene();
                params.children.forEach(child => {
                    scene.add(this.create(child));
                })
                return scene;
            }
        }
    }
    update(object, params) {
        for (const k in params) {
            switch (k) {
                case 'position':
                    object.position.set(...params[k]);
                    break;
            }
        }
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

export function Lambert() {
    return {
        kind: 'lambert',
    };
}

export function Scene(children) {
    return {
        kind: 'scene',
        children,
    };
}