import * as THREE from 'three';
import { Renderer, createThreeObject } from '../../src/index.js';


describe('nacht3d', () => {
  it('creates renderer', () => {
    const renderer =  Renderer();
    expect(createThreeObject(THREE, renderer)).be.instanceOf(THREE.WebGLRenderer);
  })
});

describe('example', () => {
  it('runs and scene has correct objects inside', () => {
    cy.visit('http://localhost:8000');

    cy.get('canvas')
      .should('have.length', 1)
      .should('have.attr', 'data-engine').and('match', /three\.js/);

    cy.window().its('scene.children')
      .should('have.length', 1)
      .its('0.isObject3D').should('equal', true)

    cy.window().its('scene.children[0].geometry.type').should('equal', 'BoxGeometry');
    cy.window().its('scene.children[0].material.type').should('equal', 'MeshBasicMaterial');

  })
})