//Do not name this macro Hex. It will interfere with the hotbar created macros
//USAGE: Remove damage fields from the Hex spell. Under 'On Use' field, type this macro's name
//On a character sheet, head to Attributes > Special Traits. Type the same macro name under Bonus Damage Macros
if (!args[0].hitTargets.length) {
  return;
}
function getHex(tactor) {
  return tactor.effects.find(
    (i) =>
      i.data.label === "Hex" &&
      i.data.origin.split(".")[1] === args[0].actor._id
  );
}
let target = canvas.tokens.get(args[0].hitTargets[0]._id);
if (args[0].tag === "OnUse") {
  new Dialog({
    title: "Choose a damage type",
    content: `
          <form class="flexcol">
            <div class="form-group">
              <select id="stat">
                <option value="str">Strength</option>
                <option value="dex">Dexterity</option>
                <option value="con">Constitution</option>
                <option value="int">Intelligence</option>
                <option value="wis">Wisdom</option>
                <option value="cha">Charisma</option>
              </select>
            </div>
          </form>
        `,
    buttons: {
      yes: {
        icon: '<i class="fas fa-bolt"></i>',
        label: "Hex",
        callback: async (html) => {
          let stat = html.find("#stat").val();
          let effect = getHex(target.actor);
          if (!effect) {
            return ui.notifications.error("No hex effect found");
          }
          let changes = effect.data.changes;
          changes.push({
            key: `flags.midi-qol.disadvantage.ability.check.${stat}`,
            value: 1,
            mode: 2,
            priority: 20,
          });
          await effect.update({ changes });
        },
      },
    },
  }).render(true);
}
if (args[0].tag === "DamageBonus") {
  if (!args[0].attackRoll) {
    return;
  }
  if (getHex(target.actor)) {
    const diceCount = args[0].isCritical ? 2 : 1;
    return { damageRoll: `${diceCount}d6[Necrotic]`, flavor: "Hex" };
  }
}
