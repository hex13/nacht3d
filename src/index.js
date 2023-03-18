export default class Nacht3D {
    constructor({ libs }) {
        this.libs = libs;
    }
    Mesh() {
        const { THREE } = this.libs;
        return new THREE.Mesh();
    }
    Cube(size) {
        const { THREE } = this.libs;
        return new THREE.BoxGeometry(...size);
    }
    Lambert() {
        const { THREE } = this.libs;
        return new THREE.MeshLambertMaterial();
    }
};