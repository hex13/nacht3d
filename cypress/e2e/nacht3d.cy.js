import * as THREE from 'three';
import { Renderer, createThreeObject } from '../../src/index.js';


describe('nacht3d', () => {
  it('creates renderer', () => {
    const renderer =  Renderer();
    expect(createThreeObject(THREE, renderer)).be.instanceOf(THREE.WebGLRenderer);
    // cy.visit('http://localhost:8000')
  })
})