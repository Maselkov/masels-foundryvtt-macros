// This maintains concentration and duration.
if (!args[0].hitTargets.length) {
  return;
}
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
let act = game.actors.get(args[0].actor._id);
function getHex(tactor) {
  return tactor.effects.find(
    (i) =>
      i.data.label === "Hex" &&
      DAE.DAEfromUuid(i.data.origin).actor.data._id === act.data._id
  )?.data;
}
let target = DAE.DAEfromUuid(args[0].hitTargets[0].uuid);
let concentrationTarget =
  act.data.flags["midi-qol"]["concentration-data"]?.targets[0];
if (!concentrationTarget) {
  ui.notifications.error("Currently not concentrating");
  return;
}
let hexedToken = DAE.DAEfromUuid(concentrationTarget.tokenUuid);
if (!hexedToken) {
  ui.notifications.error(
    "Can't get hexed token! Possibly they're in a different scene."
  );
  //TODO try to figure out a possible solution? maybe reapply hex based on concentration duration?
  return;
}
let hexedActor = hexedToken.actor;
let hexEffect = getHex(hexedActor);
if (!hexEffect) {
  ui.notifications.error("The previous target isn't hexed..?");
  return;
}
if (hexedActor.data.data.attributes.hp.value > 0) {
  ui.notifications.error("The hexed target is alive!");
  return;
}
let activeEffect = game.macros.getName("ActiveEffect");
await activeEffect.execute(hexedToken.uuid, "remove", hexEffect._id);
await activeEffect.execute(target.uuid, "add", hexEffect);
await act.update({
  "flags.midi-qol.concentration-data.targets": [
    {
      tokenUuid: target.uuid,
      actorUuid: target.actor.uuid,
    },
  ],
});
