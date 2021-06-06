// Add DAE effects: flags.dae genieType 1
//flags.dnd5e.DamageBonusMacro: ItemMacro.Genie's Wrath
let damageType = ["bludgeoning", "thunder", "fire", "cold"][
  actor.data.flags.dae?.genieType
];
if (!damageType) {
  return {};
}
if (!args[0].attackRoll) {
  return;
}
const flagName = "fish.geniesWrathTime";
if (game.combat) {
  let lastTime = getProperty(token.data.flags, flagName);
  let combatTime = game.combat.round + game.combat.turn / 100;
  if (combatTime === lastTime) {
    return {};
  }
  let useDamage = await new Promise((resolve, reject) => {
    new Dialog({
      title: "Conditional Damage",
      content: `<p>Use Genie's Wrath?</p>`,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Confirm",
          callback: () => resolve(true),
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => {
            resolve(false);
          },
        },
      },
      default: "one",
    }).render(true);
  });
  if (!useDamage) {
    return;
  }
  setProperty(token.data.flags, flagName, combatTime);
}
const prof = actor.data.data.attributes.prof;
return { damageRoll: `${prof}[${damageType}]`, flavor: "Genie's Wrath" };
