
enum Type {
    Fire,
    Water,
    Grass,
    Normal,
    Flying,
    Poison
}

function typeToColor(type : Type) : string {
    switch (type) {
        case Type.Fire:
            return "red";
        case Type.Water:
            return "blue";
        case Type.Grass:
            return "green";
        case Type.Normal:
            return "gray";
        case Type.Flying:
            // ???
            return "white";
        case Type.Poison:
            return "purple";
    }
    return "";
}
