let resourceKey = null;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
  if (value.label.toLowerCase().startsWith("healing light")) {
    resourceKey = key;
    break;
  }
}
if (!resourceKey) {
  ui.notifications.error("No healing light resource exists");
  return;
}
const diceAvailable = actor.data.data.resources[resourceKey].value;
if (!diceAvailable) {
  ui.notifications.error(`You do not have any healing light dice remaining.`);
  return;
}
let diceCount = diceAvailable;
if (diceAvailable > 1) {
  const diceMax = Math.min(
    Math.max(actor.data.data.abilities.cha.mod, 1),
    diceAvailable
  );
  let options = [];
  for (let i = 1; i <= diceMax; i++) {
    options.push(`<option value="${i}" label="${i}"></option>`);
  }
  diceCount = await new Promise((resolve, reject) => {
    new Dialog({
      title: "Healing Light",
      content: `
    <style>datalist {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

input {
  width: 100%;
}
</style>
<form>
    <div class="form-group" style="flex-direction: column">
        <input type="range" min="1" max="${diceMax}" value="1" class="slider" name="diceCount" list="healingLightDiceTickmarks">
        <datalist id="healingLightDiceTickmarks">
            ${options.join("")}
        </datalist>
    </div>
</form>
        `,
      buttons: {
        ok: {
          label: `🌞`,
          callback: async (html) => {
            resolve(Number(html.find('[name="diceCount"]').val()));
          },
        },
      },
    }).render(true);
  });
}
let roll = new Roll(diceCount + "d6").roll();
await game.dice3d?.showForRoll(roll);
new MidiQOL.DamageOnlyWorkflow(
  actor,
  DAE.DAEfromUuid(args[0].tokenUuid),
  roll.total,
  "healing",
  args[0].hitTargets,
  roll,
  { flavor: args[0].item.name, itemCardId: args[0].itemCardId }
);
await actor.update({
  [`data.resources.${resourceKey}.value`]: diceAvailable - diceCount,
});
