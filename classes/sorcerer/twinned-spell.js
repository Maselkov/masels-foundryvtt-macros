let spellData = actor.data.data.spells
let slots = Object.keys(spellData).filter(key => { if (key === "pact") { return false } if (!spellData[key].max) { return false } return true }).map(key => [parseInt(key.slice(-1)), spellData[key]]).sort((a, b) => a[0] - b[0]).map(item => item.pop(0));
let resourceKey = null;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
    if (value.label.toLowerCase() === "sorcery points") {
        resourceKey = key;
        break;
    }
}
if (!resourceKey) {
    return;
};
let points = actor.data.data.resources[resourceKey];
if (!points.value) {
    return ui.notifications.error(`You have no ${points.label}!`);
}
let options = slots.filter((slot, i) => { return i < points.value }).map((slot, i) => `<option value="${i + 1}">Level ${i + 1} (${slot.value}/${slot.max})</option>`);
options.unshift(`<option value="0">Cantrip</option>`);
new Dialog({
    title: "Twinned Spell",
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
        ok: {
            label: `⚡⚡`,
            callback: async html => {
                let slot = parseInt(html.find('[name="level"]').val());
                let cost = slot ? slot : 1;
                await actor.update({ [`data.resources.${resourceKey}.value`]: points.value - cost });
                ui.notifications.info(`Successfully deducted ${cost} You may target two creatures using a level ${slot} spell slot. Current ${points.label}: ${actor.data.data.resources[resourceKey].value}`);
            }
        }
    },
    default: "ok"
}).render(true);
