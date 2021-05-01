//Lost Mines of Phandelver
//Hew is a +1 battleaxe that deals maximum damage when the wielder hits a plant creature
let act = game.actors.get(args[0].actor._id);
let bonusDie =
  (await act.getRollData()?.flags?.dnd5e?.meleeCriticalDamageDice) || 0;
let hitTargets = args[0].hitTargets;
if (!hitTargets.length) {
  return;
}
let target = canvas.tokens.get(args[0].hitTargets[0]._id);
let numDice = 1 + (Number(args[2]) || 1);
let plant = (target.actor.data.data.details.type || "")
  .toLowerCase()
  .includes("plant");
let dieCount = 1 + bonusDie;
if (args[0].isCritical) {
  dieCount += 1;
}
let faces = 8;
let die = `${dieCount}d${faces}`;
if (plant) {
  die = faces * dieCount;
}
let damageRoll = new Roll(`${die}+1+@dexMod`, {
  dexMod: actor.data.data.abilities.dex.mod,
}).roll();
await game.dice3d?.showForRoll(damageRoll);
new MidiQOL.DamageOnlyWorkflow(
  actor,
  token,
  damageRoll.total,
  "slashing",
  args[0].hitTargets.map((t) => canvas.tokens.get(t._id)),
  damageRoll,
  {
    itemCardId: args[0].itemCardId,
    useOther: false,
  }
);
