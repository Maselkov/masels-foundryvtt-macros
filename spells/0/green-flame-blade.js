token = canvas.tokens.get(args[0].tokenId);
actor = token.actor;
const level = actor.data.data.details?.level || 0;
let attackMessage = game.messages.entities
  .reverse()
  .find(
    (message) =>
      message.data.flags["midi-qol"]?.actor === actor.id &&
      message.data.flavor !== args[0].item.name
  );
let attack = MidiQOL.Workflow.getWorkflow(
  attackMessage.data.flags["midi-qol"].itemId
);
let target = canvas.tokens.get(Array.from(attack.hitTargets)[0].id);
let bonus = "";
const bonusDice = Math.floor((level + 1) / 6);
if (bonusDice) {
  bonus = bonusDice + "d8";
  let roll = new Roll(bonus).roll();
  await game.dice3d?.showForRoll(roll);
  new MidiQOL.DamageOnlyWorkflow(
    actor,
    token,
    roll.total,
    "fire",
    [target],
    roll,
    {
      flavor: "Green-Flame Blade",
      itemCardId: attack.itemCardId,
    }
  );
}
let nearby = canvas.tokens.placeables.filter(
  (t) =>
    t.actor &&
    t.actor?.id !== args[0].actor._id &&
    t.id !== target.id &&
    t.actor?.data.data.attributes?.hp?.value > 0 &&
    t.data.disposition === target.data.disposition &&
    MidiQOL.getDistance(t, target, false) <= 5
);
let options = [];
let targetId = null;
if (nearby.length === 1) {
  targetId = nearby[0].id;
} else {
  for (const t of nearby) {
    const xDiff = target.x - t.x;
    const yDiff = target.y - t.y;
    const xText = xDiff < 0 ? "Right" : xDiff > 0 ? "Left" : "";
    let yText = "";
    if (yDiff) {
      if (!xDiff) {
        yText = yDiff < 0 ? "Down" : "Up";
      } else {
        yText = yDiff < 0 ? "Lower " : "Upper ";
      }
    }
    options.push(`<option value="${t.id}">${yText + xText}</option>`);
  }
  let dialog = new Promise((resolve, reject) => {
    new Dialog({
      title: `${args[0].item.name}`,
      content: `
        <form>
            <div class="form-group">
                <label>Target:</label>
                <select id="target" name="target">
                ${options}
                </select>
            </div>
        </form>
        `,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "Select target",
          callback: (html) => resolve(html.find('[name="target"]').val()),
        },
      },
      default: "ok",
    }).render(true);
  });
  targetId = await dialog;
}
target = canvas.tokens.get(targetId);
if (!target) {
  return;
}
const spellAbility = actor.data.data.attributes["spellcasting"];
const spellMod = actor.data.data.abilities[spellAbility].mod;
let roll = new Roll(`${bonus} + ${spellMod}`).roll();
if (bonusDice) {
  await game.dice3d?.showForRoll(roll);
}
new MidiQOL.DamageOnlyWorkflow(
  actor,
  token,
  roll.total,
  "fire",
  [target],
  roll,
  {
    flavor: "Green-Flame Blade",
    itemCardId: args[0].itemCardId,
  }
);
