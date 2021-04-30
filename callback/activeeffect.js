//args[0] = token ID
//args[1] = Name of Item in "" or update data
//args[2] = "add", "enable", "disable" or "remove"
//Crymic's Active Effect macro.
let target = canvas.tokens.get(args[0]).actor;
if (args[2] === "remove") {
  console.log("remove active effect");
  let effect_id = target.effects.entries.find((ef) => ef.data.label === args[1])
    .id;
  await target.deleteEmbeddedEntity("ActiveEffect", effect_id);
}
if (args[2] === "disable") {
  console.log("disable active effect");
  let effect_id = target.effects.entries.find((ef) => ef.data.label === args[1])
    .id;
  await target.updateEmbeddedEntity("ActiveEffect", {
    _id: effect_id,
    disabled: true,
  });
}
if (args[2] === "enable") {
  console.log("enable active effect");
  let effect_id = target.effects.entries.find((ef) => ef.data.label === args[1])
    .id;
  await target.updateEmbeddedEntity("ActiveEffect", {
    _id: effect_id,
    disabled: false,
  });
}
if (args[2] === "add") {
  console.log("add active effect");
  let effect_data = args[1];
  await target.createEmbeddedEntity("ActiveEffect", effect_data);
}
//usage
// let ActiveEffect = game.macros.getName("ActiveEffect");
// ActiveEffect.execute(target, "Name of Item" or data if add, "add", "enable", "disable" or "remove");
