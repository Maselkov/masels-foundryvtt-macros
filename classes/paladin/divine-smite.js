let act = game.actors.get(args[0].actor._id);
let tok = canvas.tokens.get(args[0].tokenId);
let spells = duplicate(act.data.data.spells);
let pactLevel = spells.pact.level;
let smiteCard = game.messages.entities
  .reverse()
  .find(
    (message) =>
      message.data.flags["midi-qol"]?.actor === act.id &&
      message.data.flavor === args[0].item.name
  );
await smiteCard.delete();
async function smite(slotLevel, pact = false) {
  let dice = Math.min(slotLevel + 1, 5);
  let attackMessage = game.messages.entities
    .reverse()
    .find(
      (message) =>
        message.data.flags["midi-qol"]?.actor === act.id &&
        message.data.flavor !== args[0].item.name
    );
  let attack = MidiQOL.Workflow.getWorkflow(
    attackMessage.data.flags["midi-qol"].itemId
  );
  if (!attack.hitTargets.size) {
    ui.notifications.error(
      `You must successfully hit in order to use ${args[0].item.name}`
    );
    return;
  }
  let target = Array.from(attack.hitTargets)[0];
  let undead = ["undead", "fiend"].some((type) =>
    (target.actor.data.data.details.type || "").toLowerCase().includes(type)
  );
  if (undead) {
    dice += 1;
  }
  let key = pact ? "pact" : "spell" + slotLevel;
  await act.update({
    [`data.spells.${key}.value`]: spells[key].value - 1,
  });
  if (attack.isCritical) {
    dice *= 2;
  }
  let roll = new Roll(`${dice}d8`).roll();
  await game.dice3d?.showForRoll(roll);
  new MidiQOL.DamageOnlyWorkflow(
    act,
    tok,
    roll.total,
    "radiant",
    attack.targets,
    roll,
    {
      flavor: `${args[0].item.name} - ${
        pact ? "Pact Magic" : "slot"
      } level <strong>${slotLevel}</strong>`,
      itemCardId: attack.itemCardId,
    }
  );
}
let options = [];
for (let i = 1; i < 10; ++i) {
  let slot = spells[`spell${i}`];
  if (!slot.max || slot.value <= 0) {
    break;
  }
  slot.level = i;
  options.push(slot);
}
if (spells.pact?.max && spells.pact?.value > 0) {
  spells.pact["pact"] = true;
  options.push(spells.pact);
}
if (!options.length) {
  ui.notifications.error("No spell slots available");
  return;
}
if (options.length === 1) {
  await smite(options[0].level);
  return;
}
options = options.map(
  (slot) =>
    `<option value="${slot.pact ? "pact" : slot.level}">${
      slot.pact ? "Pact Magic: " : ""
    }Level ${slot.level} (${slot.value}/${slot.max})</option>`
);

new Dialog({
  title: "Divine Smite",
  content: `
        <form>
            <div class="form-group">
                <label>Spell slot level:</label>
                <select id="level" name="level">
                ${options}
                </select>
            </div>
        </form>
        `,
  buttons: {
    ok: {
      label: `⚡`,
      callback: async (html) => {
        const choice = html.find('[name="level"]').val();
        const pact = choice === "pact";
        const level = pact ? pactLevel : Number(choice);
        await smite(level, pact);
      },
    },
  },
}).render(true);
