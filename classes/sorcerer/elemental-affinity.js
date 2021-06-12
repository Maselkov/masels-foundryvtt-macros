let propertyName = "flags.fish.elementalAffinityTime";
const draconicAncestry = ["acid", "lightning", "fire", "poison", "cold"][
  actor.data.flags.dae?.draconicAncestry
];
if (!draconicAncestry || draconicAncestry !== args[0].damageDetail[0].type) {
  return {};
}
token = canvas.tokens.get(args[0].tokenId);
actor = token.actor;
if (game.combat) {
  token = canvas.tokens.get(args[0].tokenId);
  actor = token.actor;
  let lastTime = getProperty(token.data.flags, "fish.elementalAffinityTime");
  let combatTime = game.combat.round + game.combat.turn / 100;
  if (combatTime === lastTime) {
    return {};
  }
  let useDamage = await new Promise((resolve, reject) => {
    new Dialog({
      title: "Conditional Damage",
      content: `<p>Use Elemental Affinity bonus damage?</p>`,
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
  await token.update({ "flags.fish.elementalAffinityTime": combatTime });
}
let resourceKey;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
  if (value.label.toLowerCase() === "sorcery points") {
    resourceKey = key;
    break;
  }
}
if (resourceKey) {
  let points = actor.data.data.resources[resourceKey].value;
  if (points >= 1) {
    let gainResistance = await new Promise((resolve, reject) => {
      new Dialog({
        title: "Resistance",
        content: `<p>Spend <strong>1 Sorcery Point</strong>
        to gain <strong>${draconicAncestry} resistance</strong>
        for <strong>1 hour</strong>?</p>`,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: "Yes",
            callback: async () => resolve(true),
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: "No",
            callback: () => {
              resolve(false);
            },
          },
        },
        default: "two",
      }).render(true);
    });
    if (gainResistance) {
      await actor.update({
        [`data.resources.${resourceKey}.value`]: points - 1,
      });
      const effect = {
        label: "Elemental Affinity Resistance",
        icon: "icons/svg/fire-shield.svg",
        changes: [
          {
            key: "data.traits.dr.value",
            value: draconicAncestry,
            mode: 2,
          },
        ],
        duration: {
          seconds: 3600,
        },
      };
      actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }
  }
}
return {
  damageRoll: `${actor.data.data.abilities.cha.mod}[${draconicAncestry}]`,
  flavor: "Elemental Affinity",
};
