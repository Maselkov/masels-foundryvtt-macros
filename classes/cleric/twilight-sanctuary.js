const lastArg = args[args.length - 1];
token = canvas.tokens.get(lastArg.tokenId);
actor = token.actor;
const origin = lastArg.efData.origin.split(".");
const originActor = game.actors.get(origin[1]);
const originItem = originActor.items.get(origin[3]).data;
if (args[0] === "on") {
  //TODO have aura here;
}
if (args[0] === "each") {
  let heal = true;
  const cleric = originActor.data.data.classes.cleric.levels;
  const healFormula = `1d6 + ${cleric}`;
  let conditions = actor.effects
    .map((effect) => effect.data)
    .filter((effect) => ["Charmed", "Frightened"].includes(effect.label));
  const conditionString = conditions.map((effect) => effect.label).join(" or ");
  if (conditions.length) {
    heal = await new Promise((resolve, reject) => {
      new Dialog({
        title: "Twilight Sanctuary",
        content: "<p>Select the Twilight Sanctuary effect</p>",
        buttons: {
          endCondition: {
            label: `End ${conditionString}`,
            callback: () => resolve(false),
          },
          heal: {
            label: `Heal ${healFormula}`,
            callback: () => {
              resolve(true);
            },
          },
        },
        default: "endCondition",
      }).render(true);
    });
  }
  if (heal) {
    let healRoll = await new Roll(healFormula).roll();
    await game.dice3d?.showForRoll(healRoll);
    new MidiQOL.DamageOnlyWorkflow(
      actor,
      token,
      healRoll.total,
      "temphp",
      [token],
      healRoll,
      {
        flavor: `Twilight Sanctuary`,
        itemCardId: "new",
        itemData: originItem,
      }
    );
    return;
  }
  let condition = conditions[0];
  if (!heal && conditions.length > 1) {
    condition = await new Promise((resolve) => {
      let buttons = conditions.map((effect) => {
        return {
          label: effect.label,
          callback: () => {
            resolve(effect);
          },
        };
      });
      new Dialog({
        title: "Select which condition to cure",
        buttons: buttons,
      }).render(true);
    });
  }
  await game.cub.removeCondition(condition._id, token._id, {
    warn: false,
  });
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: `${actor.name} ends ${condition.label} thanks to Twilight Sanctuary!`,
    type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
  });
}
