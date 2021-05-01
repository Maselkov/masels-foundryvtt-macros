let act = game.actors.get(args[0].actor._id);
async function abort() {
  let item = act.getOwnedItem(args[0].id);
  if (item.data.data.uses.value === 0) {
    await item.update({ "data.uses.value": 1 });
  }
}
let spells = actor.data.data.spells;
let options = [];
let recoverable = Math.ceil(
  (await act.getRollData().classes.wizard.levels) / 2
);
for (let i = 1; i <= 5; ++i) {
  let slot = spells["spell" + i];

  if (!slot.max || slot.max === slot.value) {
    break;
  }
  options.push(
    `<label for="${i}">Level ${i} (${slot.value}/${slot.max})</label>
    <input id="${i}"type="number" max="${slot.max}" min="1" placeholder="None" step="1"><br>`
  );
}
new Dialog({
  title: "Arcane Recovery",
  content: `
        <form>
            <p>You can recover <strong>${recoverable}</strong> spell levels</p>
                ${options.join("")}
        </form>`,
  buttons: {
    ok: {
      label: "✨",
      callback: async (html) => {
        let total = 0;
        let updates = {};
        let messageLines = ["Arcane Recovery"];

        for (let i = 1; i <= 5; ++i) {
          let value = parseInt(html.find("#" + i).val()) | 0;
          let slot = spells["spell" + i];
          if (!slot.max) {
            continue;
          }
          if (slot.value + value > slot.max) {
            await abort();
            ui.notifications.error(
              `You tried to recover moreI level ${i} spell slots than maximum`
            );
            return;
          }
          total += value * i;
          if (total > recoverable) {
            await abort();
            ui.notifications.error(
              `You tried to recover more than ${recoverable} spell levels`
            );
            return;
          }
          updates[`data.spells.spell${i}.value`] = slot.value + value;
          messageLines.push(`Level ${i}: recovered <strong>${value}</strong>`);
        }
        await actor.update(updates);
        ChatMessage.create({
          content: messageLines.join("\n"),
          speaker: ChatMessage.getSpeaker(),
        });
      },
    },
  },
  default: "ok",
}).render(true);
