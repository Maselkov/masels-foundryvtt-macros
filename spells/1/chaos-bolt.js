token = canvas.tokens.get(args[0].tokenId);
actor = token.actor;
const damage_types = [
  "Acid",
  "Cold",
  "Fire",
  "Fire",
  "Lightning",
  "Poison",
  "Psychic",
  "Thunder",
];
if (args[0].hitTargets.length > 0) {
  let rolledTypes = args[0].damageRoll.terms
    .find((t) => t?.faces === 8)
    .results.map((e) => damage_types[e.result - 1]);
  let types = [...new Set(rolledTypes)]; // Remove duplicates
  let bounce = types.length !== rolledTypes.length;
  let type;
  if (types.length !== 1) {
    type = await choose(types);
  } else {
    type = types[0];
  }
  if (bounce) {
    ui.notifications.info(
      `Chaos bolt bounces! Cast it again on another target within 30ft of the current one.`
    );
  }
  let damageRoll = new Roll(`${args[0].damageRoll.total}`).roll();
  await new MidiQOL.DamageOnlyWorkflow(
    actor,
    token,
    damageRoll.total,
    type,
    args[0].hitTargets.map((t) => canvas.tokens.get(t._id)),
    damageRoll,
    { itemCardId: args[0].itemCardId, useOther: false }
  );
}
async function choose(options) {
  let value = await new Promise((resolve) => {
    let buttons = options.map((type) => {
      return {
        label: type,
        callback: () => {
          resolve(type);
        },
      };
    });
    new Dialog({
      title: "Select damage type",
      buttons: buttons,
    }).render(true);
  });
  return value;
}
