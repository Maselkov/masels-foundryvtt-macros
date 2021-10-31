if (!["fire", "radiant"].includes(args[0].damageDetail[0].type)) {
  return {};
}
actor = args[0]?.actor;
const bonus = actor.data.abilities.cha.mod;
return {
  damageRoll: `${bonus}`,
  flavor: "Radiant Soul",
};
