new Dialog({
  title: "Deflect Missiles",
  content: `
        <form>
            <div class="form-group">
                <label>Damage taken from the projectile: </label>
                <input type="number" id="damage" name="damage">
            </div>
        </form>
        `,
  buttons: {
    ok: {
      label: `🏓`,
      callback: async (html) => {
        let damage = parseInt(html.find('[name="damage"]').val());
        let data = actor.data.data;
        let monk = await actor.getRollData().classes.monk;
        let healRoll = new Roll("{1d10+@dexMod+@monkLevel, @damage}kl", {
          dexMod: data.abilities.dex.mod,
          monkLevel: monk.levels,
          damage: damage,
        }).roll();
        let token = canvas.tokens.get(args[0].tokenId);
        await game.dice3d.showForRoll(healRoll);
        new MidiQOL.DamageOnlyWorkflow(
          actor,
          token,
          healRoll.total,
          "healing",
          [token],
          healRoll,
          { flavor: `(deflected)`, itemCardId: args[0].itemCardId }
        );
        if (healRoll.total === damage) {
          return ui.notifications.info(
            `Missile caught! You can throw it back using Ki Menu`
          );
        }
      },
    },
  },
  default: "ok",
}).render(true);
