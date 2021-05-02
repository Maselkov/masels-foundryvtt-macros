// HotbarUsesGeneric
// Consumed=data.resources.primary.value
// Max=data.resources.primary.max
// Copy this to your hotbar for uses if using the Hotbar Uses module
if (args[0].targets.length != 1) {
  return ui.notifications.error(`You may only target a single token`);
}
let activeEffect = game.macros.getName("ActiveEffect");
let target = canvas.tokens.get(args[0].targets[0]._id);
let illegal = ["undead", "construct"].some((type) =>
  (target.actor.data.data.details.type || "").toLowerCase().includes(type)
);
if (illegal)
  return ui.notifications.error(
    `You cannot use Lay on Hands on Undead or Constructs`
  );
let act = game.actors.get(args[0].actor._id);
let tok = canvas.tokens.get(args[0].tokenId);
let resourceKey = null;
for (const [key, value] of Object.entries(actor.data.data.resources)) {
  if (value.label.toLowerCase().startsWith("lay on hands")) {
    resourceKey = key;
    break;
  }
}
if (!resourceKey) {
  return ui.notifications.error("No Lay on Hands resource");
}
const resourcePath = `data.resources.${resourceKey}.value`;
let resource = actor.data.data.resources[resourceKey];
let points = resource.value || 0;
if (!points) {
  return ui.notifications.warn(`You are out of Lay on Hands HP`);
}
const targetHp = target.actor.data.data.attributes.hp;
const missingHp = targetHp.max - targetHp.value;
const maxHeal = Math.min(points, missingHp);
let curableConditions = target.actor.effects.filter((effect) =>
  ["Diseased", "Poisoned"].includes(effect.data.label)
);
const curable = points >= 5 && curableConditions.length;
const healable = missingHp > 0;
let cureLabel = "Cure ";
if (curableConditions.length === 1) {
  cureLabel += curableConditions[0].data.label + " (Cost: 5)";
} else {
  cureLabel += "Poison or Diesease";
}
if (curable && healable) {
  return new Dialog({
    title: "Lay on Hands",
    content: `<p>[<strong>${points}</strong>] Lay on Hands HP remaining.</p>`,
    buttons: {
      heal: { label: "Heal", callback: async () => heal() },
      cure: {
        label: cureLabel,
        callback: async () => cure(),
      },
    },
  }).render(true);
}
if (curable) {
  return await cure();
}
if (healable) {
  return await heal();
}
return ui.notifications.error("There is nothing to heal or cure");

async function conditionSelectDialog() {
  let options = [];
  for (const effect of curableConditions) {
    const label = effect.data.label;
    options.push(`<option value="${label}">${label}</option>`);
  }
  new Dialog({
    title: "Lay on Hands: Curing",
    content: `<p>Select which condition you wish to cure</p>
              <form>
                <div class="form-group">
                  <select id="condition" name="condition">
                    ${options}
                  </select>
                </div>
              </form>`,
    buttons: {
      ok: {
        label: "Cure",
        callback: async (html) => {
          let name = html.find('[name="condition"]').val();
          let effect = target.actor.effects.entries.find(
            (ef) => ef.data.label === name
          );
          return await cureCondition(effect);
        },
      },
    },
  }).render(true);
}

async function cureCondition(effect) {
  await activeEffect.execute(target.id, "remove", effect.data._id);
  await act.update({ [resourcePath]: points - 5 });
  let chatContent = `
                              <div class="midi-qol-nobox">
                                  <div class="midi-qol-flex-container">
                                      <div>Cures ${effect.data.label}:</div>
                                      <div class="midi-qol-target-npc midi-qol-target-name" id="${target.data._id}">
                                          ${target.name}
                                      </div>
                                      <div>
                                          <img src="${target.data.img}" width="30" height="30" style="border:0px">
                                      </div>
                                  </div>
                              </div>`;
  const chatMessage = game.messages.get(args[0].itemCardId);
  let content = duplicate(chatMessage.data.content);
  const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
  const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;
  content = content.replace(searchString, replaceString);
  chatMessage.update({ content: content });
}

async function cure() {
  if (curableConditions.length === 1) {
    return await cureCondition(curableConditions[0]);
  }
  await conditionSelectDialog();
}
function heal() {
  new Dialog({
    title: "Lay on Hands: Healing",
    content: `
      <form>
        <div class="form-group">
          <label for="hp">Amount to restore to ${target.name}:</label>
          <input id="hp" name="hp" type="number" min="0" max="${maxHeal}" placeholder="Maximum ${maxHeal}"></input>
        </div>
      </form>`,
    buttons: {
      heal: {
        label: "Heal",
        callback: async (html) => {
          let hp = parseInt(html.find('[name="hp"]').val());
          if (hp < 1 || hp > maxHeal) {
            return ui.notifications.error(`Invalid heal amount`);
          }
          let heal = new Roll(`${hp}`).roll();
          new MidiQOL.DamageOnlyWorkflow(
            act,
            tok,
            heal.total,
            "healing",
            [target],
            heal,
            { flavor: `Lay on Hands`, itemCardId: args[0].itemCardId }
          );
          await act.update({ [resourcePath]: points - hp });
        },
      },
    },
  }).render(true);
}
