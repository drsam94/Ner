/// <reference path="./Monster.ts" />

const AllSpecies : Record<string, Species> = {};

function defineSpecies(name : string, types : Type[]) {
    const species = new Species(name, Object.keys(AllSpecies).length, types);
    AllSpecies[name] = species;
}

defineSpecies("Bulbasaur", [Type.Grass, Type.Poison]);
defineSpecies("Ivysaur", [Type.Grass, Type.Poison]);
defineSpecies("Venusaur", [Type.Grass, Type.Poison]);
defineSpecies("Charmander", [Type.Fire]);
defineSpecies("Charmeleon", [Type.Fire]);
defineSpecies("Charmeleon", [Type.Fire, Type.Flying]);
defineSpecies("Squirtle", [Type.Water]);
defineSpecies("Wartortle", [Type.Water]);
defineSpecies("Blastoise", [Type.Water]);
