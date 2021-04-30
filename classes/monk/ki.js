async function patientDefense() {
  game.dnd5e.rollItemMacro("Dodge");
  return true;
}
async function deflectMissiles() {
  game.dnd5e.rollItemMacro("Deflected Missile");
  return true;
}
function stunningStrike() {
  console.log("weh");
}
let resourceKey = null;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
  if (value.label.toLowerCase().startsWith("ki")) {
    resourceKey = key;
    break;
  }
}
if (!resourceKey) {
  return;
}
let points = actor.data.data.resources[resourceKey];
let monk = await actor.getRollData().classes.monk;
console.log(monk);
let subClass = monk.subclass;

points.value = points.value ? points.value : 0;
const features = [
  { name: "Flurry of Blows", level: 2, cost: 1 },
  { name: "Patient Defense", cost: 1, level: 2, callback: patientDefense },
  { name: "Step of the Wind", level: 2, cost: 1 },
  {
    name: "Deflect Missiles: Yeet",
    cost: 1,
    level: 3,
    callback: deflectMissiles,
  },
  { name: "Stunning Strike", cost: 1, level: 5, callback: stunningStrike },
].filter((item) => item.cost <= points.value && item.level <= monk.levels);

let monkDie =
  "1d" +
  (monk.levels > 16 ? 10 : monk.levels > 10 ? 8 : monk.levels > 4 ? 6 : 4);
let options = features.map(
  (o) => `<option value="${o.name}">${o.name} (${o.cost} Ki Points)</option>`
);
new Dialog({
  title: "Ki-Point Spendingifier",
  content: `
        <form>
            Ki points: <strong>${points.value}</strong>/<strong>${points.max}</strong><br>
            <div class="form-group">
                <label>Feature: </label>
                <select id="feature" name="feature">
                ${options}
                </select>
            </div>
        </form>
        `,
  buttons: {
    ok: {
      label: `👊`,
      callback: async (html) => {
        let feature = features.filter(
          (item) => item.name === html.find('[name="feature"]').val()
        )[0];
        const resourceData = `data.resources.${resourceKey}.value`;

        let successful = false;
        if ("callback" in feature) {
          if (await feature.callback()) {
            successful = true;
          }
        } else {
          successful = true;
        }
        if (successful) {
          await actor.update({
            [resourceData]: points.value - feature.cost,
          });
        }
      },
    },
  },
  default: "ok",
}).render(true);
