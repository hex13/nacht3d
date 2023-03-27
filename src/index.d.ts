export type EntityParams = Record<string, any>;
export type Entity = Record<string, any> & Record<"kind", string>;

interface Geometries {
    Cube:  (params: EntityParams) =>  Entity
    Sphere: (params: EntityParams) =>  Entity
};
export const geometries: Geometries;

