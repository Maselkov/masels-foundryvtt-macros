//Crymic's CUB macro.
let target = canvas.tokens.get(args[0]);
let condition = args[1];
let state = args[2];
if (state === "remove") {
    await game.cub.removeCondition(condition, target, { warn: false });
}
if (state === "add") {
    await game.cub.addCondition(condition, target, { warn: false });
}
