
//Modified Crymic's Ice Knife macro
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
let caster = game.actors.get(args[0].actor._id);
let dc = caster.getRollData().attributes.spelldc;
let itemD = args[0].item;
let aoeDamage = Number(args[0].spellLevel) + 1;
let firstTarget = canvas.tokens.get(args[0].targets[0]._id);
let distance = 9.5;
let damageRoll = new Roll(`${aoeDamage}d6`).roll();
await game.dice3d.showForRoll(damageRoll);
let damage_target = [];
let hitTargets = [];
let saveResult = "";
let aoe_target = canvas.tokens.placeables.filter(target => (canvas.grid.measureDistance(firstTarget.center, target.center) <= distance));
for (let target of aoe_target) {
    let save = await target.actor.rollAbilitySave('dex', { chatMessage: false, fastForward: true });
    if (save.total >= dc) {
        saveResult = `saves with ${save.total}`;
    } else {
        hitTargets.push(target);
        saveResult = `fails with ${save.total}`;
    }
    damage_target.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div>${saveResult}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
}
new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "cold", hitTargets, damageRoll, { flavor: `${itemD.name} - Splash Damage (Cold)`, itemData: args[0].item, itemCardId: "new" });
await wait(1000);
let lastused = game.messages.entities.filter(i => i.user.data._id === game.user.id && i.data.flavor === itemD.name);
let count = lastused.length - 1;
let lastAttack = lastused[count].data;
let damage_list = damage_target.join('');
let damage_results = `<div><div class="midi-qol-nobox">${damage_list}</div></div>`;
const chatMessage = await game.messages.get(lastAttack._id);
let content = await duplicate(chatMessage.data.content);
const searchString = '<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display"></div></div>';
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}</div></div>`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });

