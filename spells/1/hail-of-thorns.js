if (args[0].tag !== "DamageBonus") {
    return;
}
if (!args[0].attackRoll) {
    return;
}
if (args[0].item.data.actionType !== "rwak") {
    return
}
if (args[0].hitTargets.length < 1) return {};
let target = args[0].hitTargets[0];
let nearby = canvas.tokens.placeables.filter(
    (t) =>
        t.actor &&
        t.actor?.data.data.attributes?.hp?.value > 0 &&
        MidiQOL.getDistance(t, target, false) <= 7.5
)

let failedSaves = [];
let successfullSaves = [];
let dc = args[0].actor.data.attributes.spelldc;
let saveResult = ""
for (let creature of nearby) {
    let save = await creature.actor.rollAbilitySave('dex', {
        chatMessage: false,
        fastForward: true
    });
    if (save.total >= dc) {
        saveResult = `saves with ${save.total}`;
    } else {
        failedSaves.push(creature);
    }
}
let diceCount = actor.data.flags.dae?.hailOfThorns;
let damageRoll = new Roll(`${diceCount}d10`).roll();
await new MidiQOL.DamageOnlyWorkflow(args[0].actor, args[0].token, damageRoll.total, "piercing", failedSaves, damageRoll, {
    flavor: `Hail of Thorns`,
    itemCardId: args[0].itemCardId
});
await new MidiQOL.DamageOnlyWorkflow(args[0].actor, args[0].token, damageRoll.total / 2, "piercing", successfullSaves, damageRoll, {
    flavor: `Hail of Thorns`,
    itemCardId: args[0].itemCardId
});
