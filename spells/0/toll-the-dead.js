if (!args[0].failedSaves.length) {
  return;
}
let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let act = game.actors.get(args[0].actor._id);
let tok = canvas.tokens.get(args[0].tokenId);
const level = act.data.data.details?.level || 0;
let dice = 1 + Math.floor((level + 1) / 6);
const hp = target.actor.data.data.attributes.hp;
const damaged = hp.max !== hp.value;
const faces = damaged ? 12 : 8;
let roll = new Roll(`${dice}d${faces}`).roll();
await game.dice3d?.showForRoll(roll);
new MidiQOL.DamageOnlyWorkflow(
  act,
  tok,
  roll.total,
  "necrotic",
  [target],
  roll,
  { itemCardId: args[0].itemCardId }
);
