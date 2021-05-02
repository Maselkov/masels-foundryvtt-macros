let act = game.actors.get(args[0].actor._id);
let spells = act.data.data.spells;
let options = [];
let smiteCard = game.messages.entities
  .reverse()
  .find(
    (message) =>
      message.data.flags["midi-qol"]?.actor === act.id &&
      message.data.flavor === args[0].item.name
  );
await smiteCard.delete();
for (let i = 1; i < 10; ++i) {
  let slot = spells[`spell${i}`];
  if (!slot.max || slot.value <= 0) {
    break;
  }
  options.push(slot);
}
options = options.map(
  (slot, i) =>
    `<option value="${i + 1}">Level ${i + 1} (${slot.value}/${
      slot.max
    })</option>`
);
if (!options.length) {
  ui.notifications.error("No spell slots available");
  return;
}
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
        let slot = parseInt(html.find('[name="level"]').val());
        let target = canvas.tokens.get(args[0].hitTargets[0]._id);
        let dice = slot + 1;
        let undead = ["undead", "fiend"].some((type) =>
          (target.actor.data.data.details.type || "")
            .toLowerCase()
            .includes(type)
        );
        if (undead) {
          dice += 1;
        }
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
        let key = "spell" + slot;
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
          target,
          roll.total,
          "radiant",
          [target],
          roll,
          { flavor: args[0].item.name, itemCardId: attack.itemCardId }
        );
      },
    },
  },
}).render(true);
