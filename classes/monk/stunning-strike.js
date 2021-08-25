//Two effects. One, named Fiery Shackles, macro repeat at turn end. The other can be named whatever/
const lastArg = args[args.length - 1];
token = canvas.tokens.get(lastArg.tokenId);
actor = token.actor;
let item = lastArg.efData.flags.dae.itemData;
if (args[0] === "each") {
  const saveType = item.data.save.ability;
  const DC = item.data.save.dc;
  const flavor = `${item?.name || ""} ${
    CONFIG.DND5E.abilities[saveType]
  } DC${DC}`;
  let save = await actor.rollAbilitySave(saveType, {
    flavor,
    fastForward: true,
  });
  await game.dice3d?.showForRoll(save);
  if (save.total >= DC) {
    let toRemove = actor.data.effects
      .filter((effect) => effect.data.flags?.dae?.itemData._id === item._id)
      .map((effect) => effect.data._id);
    await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `${actor.name} shrugs off the effects of ${item?.name}!`,
      type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
    });
  }
  return;
}
