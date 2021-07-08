const flag = "tashasCausticBrewDice";
if (args[0]?.tag === "OnUse") {
  token = canvas.tokens.get(args[0].tokenId);
  actor = token.actor;
  DAE.setFlag(actor, flag, args[0].spellLevel * 2);
}

if (args[0] === "each") {
  const lastArg = args[args.length - 1];
  const origin = lastArg.efData.origin.split(".");
  const originActor = game.actors.get(origin[1]);
  const originItem = originActor.items.get(origin[3]).data;
  token = canvas.tokens.get(lastArg.tokenId);
  actor = token.actor;
  let dice = DAE.getFlag(originActor, flag);
  let roll = await new Roll(`${dice}d4`).roll();
  await game.dice3d?.showForRoll(roll);
  new MidiQOL.DamageOnlyWorkflow(
    originActor,
    token,
    roll.total,
    "acid",
    [token],
    roll,
    {
      flavor: originItem.name,
      itemCardId: "new",
      itemData: originItem,
    }
  );
}
