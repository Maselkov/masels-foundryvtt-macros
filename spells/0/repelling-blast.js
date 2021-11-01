if (!args[0].hitTargets.length) { return };
if (args[0].tag !== "DamageBonus") {
    return;
}
if (!args[0].attackRoll) {
    return;
}
if (args[0].item.name !== "Eldritch Blast") {
    return;
}
new Dialog({
    title: "Repelling Blast",
    content: `<p>Use Repelling Blast to push the target back <b>10 Feet</b>?</p>`,
    buttons: {
        one: {
            icon: '<i class="fas fa-check"></i>',
            label: "Yes",
            callback: async () => await game.macros.getName("Knockback").execute(args[0].tokenId, args[0].hitTargets[0].id, 10),
        },
        two: {
            icon: '<i class="fas fa-times"></i>',
            label: "No",
        },
    },
    default: "one",
}).render(true);

