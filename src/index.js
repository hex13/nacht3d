export default class Nacht3D {
    constructor({ libs }) {
        this.libs = libs;
    }
    create(params) {
        const { THREE } = this.libs;
        switch (params.kind) {
            case 'mesh':
                return new THREE.Mesh();
            case 'cube':
                return new THREE.BoxGeometry(...params.size);
            case 'lambert':
                return new THREE.MeshLambertMaterial();
        }
    }
};

export function Mesh() {
    return {
        kind: 'mesh'
    };
}

export function Cube(size) {
    return {
        kind: 'cube',
        size,
    };
}

export function Lambert() {
    return {
        kind: 'lambert',
    };
}