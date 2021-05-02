// Set this macro to execute as GM
let tok = canvas.tokens.get(args[0]);
let act = tok.actor;
let hpLost = 0;
let attack = game.messages.entities
  .reverse()
  .slice(0, 20)
  .filter((message) => message.data.flags["midi-qol"]?.itemId)
  .map((message) =>
    MidiQOL.Workflow.getWorkflow(message.data.flags["midi-qol"].itemId)
  )
  .filter((workflow) => "damageList" in workflow)
  .find((workflow) => {
    for (const damage of workflow.damageList) {
      if (damage.actorID === act.id) {
        hpLost = damage.totalDamage;
        return true;
      }
    }
  });

let monk = await act.getRollData().classes.monk;
let healRoll = new Roll("{1d10+@dexMod+@monkLevel, @damage}kl", {
  dexMod: act.data.data.abilities.dex.mod,
  monkLevel: monk.levels,
  damage: hpLost,
}).roll();
const user = game.users.find((u) => u.data.character === act.id) || game.user;
await game.dice3d.showForRoll(healRoll, user, true);
let flavor = `${tok.name} deflects`;
if (healRoll.total === hpLost) {
  flavor = `${tok.name} catches the missile!`;
  ui.notifications.info(`Missile caught! You can throw it back using Ki Menu`);
}
new MidiQOL.DamageOnlyWorkflow(
  act,
  tok,
  healRoll.total,
  "healing",
  [tok],
  healRoll,
  { flavor: flavor, itemCardId: attack.itemCardId }
);
