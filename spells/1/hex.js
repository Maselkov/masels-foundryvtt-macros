if (args[0].hitTargets.length === 0) {
  return;
}
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (args[0].tag === "OnUse") {
  let actor = await fromUuid(args[0].actorUuid);
  const lvl = args[0].spellLevel;
  const durationSeconds = [3, 4].includes(lvl)
    ? 60 * 60 * 8
    : lvl > 4
    ? 60 * 60 * 24
    : 60 * 60;
  //Needs to be a callback so that effect is applied first.
  let clicked = false;
  async function setupHex(hexStat) {
    console.log("weh");
    if (clicked) {
      return;
    }
    console.log("weh2");
    clicked = true;
    await wait(1000);
    let target = args[0].hitTargets[0].actor;
    let effect = target.effects.find((i) => i.data.origin === args[0].itemUuid);
    console.log(effect);
    if (!effect) {
      return ui.notifications.error("No hex effect found");
    }
    effect = duplicate(effect);
    effect.duration.seconds = durationSeconds;
    effect.changes.push({
      key: `flags.midi-qol.disadvantage.ability.check.${hexStat}`,
      value: 1,
      mode: 2,
      priority: 20,
    });
    console.log(effect);
    MidiQOL.socket().functions.get("updateEffects")({
      actorUuid: target.uuid,
      updates: [effect],
    });
    let duration = args[0].item.effects[0].duration;
    duration.seconds = durationSeconds;
    duration.startTime = game.time.worldTime;
    const effectData = {
      changes: [
        {
          key: `flags.maselkov.hexTarget`,
          mode: 5,
          value: target.uuid,
          priority: 20,
        },
        {
          key: "flags.dnd5e.DamageBonusMacro",
          mode: 0,
          value: `ItemMacro.${args[0].item.name}`,
          priority: 20,
        },
      ],
      origin: args[0].itemUuid,
      disabled: false,
      duration: duration,
      icon: args[0].item.img,
      label: args[0].item.name,
    };
    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    let concentrationEffect = duplicate(
      actor.effects.find(
        (i) => i.data.flags?.["midi-qol"]?.isConcentration === args[0].itemUuid
      ).data
    );
    if (concentrationEffect) {
      await actor.updateEmbeddedDocuments("ActiveEffect", [
        { _id: concentrationEffect._id, duration: duration },
      ]);
    }
  }
  new Dialog({
    title: "Choose the stat to damage",
    buttons: [
      {
        label: "STR",
        icon: '<i class="fas fa-dumbbell"></i><br>',
        callback: () => setupHex("str"),
      },
      {
        label: "DEX",
        icon: '<i class="fas fa-feather"></i><br>',
        callback: () => setupHex("dex"),
      },
      {
        label: "CON",
        icon: '<i class="fas fa-heart"></i><br>',
        callback: () => setupHex("con"),
      },
      {
        label: "INT",
        icon: '<i class="fas fa-book"></i><br>',
        callback: () => setupHex("int"),
      },
      {
        label: "WIS",
        icon: '<i class="fas fa-eye"></i><br>',
        callback: () => setupHex("wis"),
      },
      {
        label: "CHA",
        icon: '<i class="fas fa-hands-helping"></i><br>',
        callback: () => setupHex("cha"),
      },
    ],
  }).render(true);
}
if (args[0].tag === "DamageBonus") {
  if (!args[0].attackRoll) {
    return;
  }
  console.log(args);
  let item = await fromUuid(args[0].sourceItemUuid);
  let target = args[0].hitTargets[0];
  if (target.uuid !== getProperty(args[0].actor.flags, "maselkov.hexTarget")) {
    return {};
  }
  const diceMult = args[0].isCritical ? 2 : 1;
  return { damageRoll: `${diceMult}d6[necrotic]`, flavor: item.name };
}
