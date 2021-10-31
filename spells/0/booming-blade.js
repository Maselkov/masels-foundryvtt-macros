await game.messages.entities
  .reverse()
  .find(
    (message) =>
      message.data.flags["midi-qol"]?.actorUuid === args[0].actorUuid &&
      message.data.flavor === args[0].item.name
  );
const flag = "BoomingBladePosition";
let lastArg = args.at(-1);
const level = actor.data.data.details?.level || 0;
if (args[0]?.tag === "OnUse") {
  token = canvas.tokens.get(args[0].tokenId);
  actor = token.actor;
  DAE.setFlag(actor, flag, args[0].spellLevel * 2);
}
if (args[0] === "on") {
  let origin = await fromUuid(lastArg.efData.origin);
  let originActor = origin.parent;
  let target = await fromUuid(lastArg.tokenUuid);
  let d = duplicate(target);
  const hookId = Hooks.on("preUpdateToken", (changed, options, user) => {
    if (options._id === target.data._id && ("x" in options || "y" in options)) {
      let damageRoll = new Roll(1 + "d8").roll();
      new MidiQOL.DamageOnlyWorkflow(
        originActor,
        target,
        damageRoll.total,
        "thunder",
        [target],
        damageRoll,
        {
          flavor: `${origin.name} - movement damage`,
          itemCardId: "new",
          itemData: origin.data,
        }
      );
      target.actor.deleteEmbeddedDocuments("ActiveEffect", [
        target.actor.effects.get(lastArg.effectId).data._id,
      ]);
    }
  });
  DAE.setFlag(target, "BoomingBladeEffectHook", hookId);
}
if (args[0] === "off") {
  let target = await fromUuid(lastArg.tokenUuid);
  let hookFlag = DAE.getFlag(target, "BoomingBladeEffectHook");
  Hooks.off("preUpdateToken", hookFlag);
  DAE.unsetFlag(target, flag);
  DAE.unsetFlag(target, "BoomingBladeEffectHook");
}
