// HotbarUsesGeneric
// Consumed=data.resources.primary.value
// Max=data.resources.primary.max
// Copy this to your hotbar for uses if using the Hotbar Uses module
let spellData = actor.data.data.spells;
let slots = Object.keys(spellData)
  .filter((key) => {
    if (key === "pact") {
      return false;
    }
    if (!spellData[key].max) {
      return false;
    }
    return true;
  })
  .map((key) => [parseInt(key.slice(-1)), spellData[key]])
  .sort((a, b) => a[0] - b[0])
  .map((item) => item.pop(0));
let resourceKey = null;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
  if (value.label.toLowerCase() === "sorcery points") {
    resourceKey = key;
    break;
  }
}
if (!resourceKey) {
  return;
}
const pointCost = [2, 3, 5, 6, 7];
let points = actor.data.data.resources[resourceKey];
let craft = null;
points.value = points.value ? points.value : 0;
let options = slots.map(
  (slot, i) =>
    `<option value="${i + 1}">Level ${i + 1} (${slot.value}/${
      slot.max
    })</option>`
);
new Dialog({
  title: "Flexible Casting",
  content: `
        <form>
            Sorcery points: <strong>${points.value}</strong>/<strong>${points.max}</strong><br>
            <div class="form-group">
                <label>Slot level:</label>
                <select id="level" name="level">
                ${options}
                </select>
            </div>
        </form>
        `,
  buttons: {
    convert: {
      label: `Slots 👈 Points`,
      callback: () => (craft = true),
    },
    craft: {
      label: `Slots 👉 Points`,
      callback: () => (craft = false),
    },
  },
  default: "convert",
  close: async (html) => {
    if (craft === null) {
      return;
    }
    let slot = parseInt(html.find('[name="level"]').val());
    let slotData = spellData["spell" + slot];
    const resourceData = `data.resources.${resourceKey}.value`;
    if (!craft) {
      if (!slotData.value) {
        return ui.notifications.error(`You have no level ${slot} spell slots!`);
      }
      await actor.update({
        [resourceData]: Math.min(points.value + slot, points.max),
        [`data.spells.spell${slot}.value`]: slotData.value - 1,
      });
      ui.notifications.info(
        `Successfully converted one level ${slot} spell to ${points.label}. Current ${points.label}: ${actor.data.data.resources[resourceKey].value}`
      );
      return;
    }
    if (slot > 5) {
      return ui.notifications.error(
        `You cannot create spell slots higher than level 5!`
      );
    }
    if (slotData.value >= slotData.max) {
      return ui.notifications.error(
        `You're at maximum level ${slot} spell slots!`
      );
    }
    let cost = pointCost[slot - 1];
    if (points.value < cost) {
      return ui.notifications.error(
        `You don't have enough ${points.label} to craft this spell!`
      );
    }
    await actor.update({
      [resourceData]: points.value - cost,
      [`data.spells.spell${slot}.value`]: slotData.value + 1,
    });
    ui.notifications.info(
      `Successfully converted ${cost} ${points.label} to one level ${slot} spell slot. Current ${points.label}: ${actor.data.data.resources[resourceKey].value}`
    );
  },
}).render(true);
