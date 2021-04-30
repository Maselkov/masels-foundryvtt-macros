//Modified Crymic's Chromatic Orb macro

const damage_types = [`Acid`, `Cold`, `Fire`, `Lightning`, `Poison`, `Thunder`];
if (args[0].hitTargets.length > 0) {
  let damage_type = await choose(damage_types, `Choose Damage Type: `);
  let actorD = game.actors.get(args[0].actor._id);
  let tokenD = canvas.tokens.get(args[0].tokenId);
  let target = canvas.tokens.get(args[0].hitTargets[0]._id);
  let level = Number(args[0].spellLevel + 2);
  if (args[0].isCritical) level *= 2;
  let damageRoll = new Roll(`${level}d8`).roll();
  await game.dice3d.showForRoll(damageRoll);
  new MidiQOL.DamageOnlyWorkflow(
    actorD,
    tokenD,
    damageRoll.total,
    damage_type,
    args[0].hitTargets.map((t) => canvas.tokens.get(t._id)),
    damageRoll,
    { itemCardId: args[0].itemCardId }
  );
}

async function choose(options, prompt) {
  let value = await new Promise((resolve) => {
    let dialogOptions = options
      .map((o) => `<option value="${o}">${o}</option>`)
      .join(``);
    let content = `<form><div class="form-group"><label for="choice">${prompt}</label><select id="choice">${dialogOptions}</select></div></form>`;
    new Dialog({
      content,
      buttons: {
        OK: {
          label: `OK`,
          callback: async (html) => {
            resolve(html.find("#choice").val());
          },
        },
      },
    }).render(true);
  });
  return value;
}
