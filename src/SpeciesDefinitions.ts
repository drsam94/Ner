/// <reference path="./Monster.ts" />

const AllSpecies : Record<string, Species> = {};

function defineSpecies(name : string, types : Type[], baseStats : Stats) {
    const species = new Species(name, Object.keys(AllSpecies).length, types, baseStats);
    AllSpecies[name] = species;
}

function initSpecies() {
    defineSpecies("Bulbasaur", [Type.Grass, Type.Poison],
        new Stats(45, 49, 49, 65, 65, 45));
    defineSpecies("Ivysaur", [Type.Grass, Type.Poison],
        new Stats(60, 62, 63, 80, 80, 60));
    defineSpecies("Venusaur", [Type.Grass, Type.Poison],
        new Stats(80, 82, 83, 100, 100, 80));
    defineSpecies("Charmander", [Type.Fire],
        new Stats(39, 52, 43, 60, 50, 65));
    defineSpecies("Charmeleon", [Type.Fire],
        new Stats(58, 64, 58, 80, 65, 80));
    defineSpecies("Charizard", [Type.Fire, Type.Flying],
        new Stats(78, 84, 78, 109, 85, 100));
    defineSpecies("Squirtle", [Type.Water],
        new Stats(44, 48, 65, 50, 64, 43));
    defineSpecies("Wartortle", [Type.Water],
        new Stats(59, 63, 80, 65, 80, 58));
    defineSpecies("Blastoise", [Type.Water],
        new Stats(79, 83, 100, 85, 105, 78));
}
