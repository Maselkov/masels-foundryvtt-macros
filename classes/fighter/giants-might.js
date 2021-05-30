const lastArg = args[args.length - 1];
let flagName = "giantsMight";
if (args[0] === "on") {
  token = canvas.tokens.get(lastArg.tokenId);
  actor = token.actor;
  let originalSize = token.data.width;
  let size = originalSize + 1;
  token.update({ width: size, height: size });
  DAE.setFlag(actor, flagName, {
    size: originalSize,
  });
  return;
}
if (args[0] === "off") {
  token = canvas.tokens.get(lastArg.tokenId);
  actor = token.actor;
  let flag = DAE.getFlag(actor, flagName);
  token.update({ width: flag.size, height: flag.size });
  DAE.unsetFlag(actor, flagName);
  return;
}
if (args[0]?.tag === "DamageBonus") {
  if (!args[0].attackRoll) {
    return;
  }
  if (game.combat) {
    let lastTime = getProperty(token.data.flags, "fish.giantsMightTime");
    let combatTime = game.combat.round + game.combat.turn / 100;
    if (combatTime === lastTime) {
      return {};
    }
    let dialog = new Promise((resolve, reject) => {
      new Dialog({
        title: "Conditional Damage",
        content: `<p>Use Giant's Might bonus damage?</p>`,
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
    let useDamage = await dialog;
    if (!useDamage) {
      return;
    }
    setProperty(token.data.flags, "fish.giantsMightTime", combatTime);
  }
  const dice = args[0].isCritical ? 2 : 1;
  return { damageRoll: `${dice}d6`, flavor: "Giant's Might" };
}
