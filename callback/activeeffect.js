//args[0] = actorId
//args[1] = ["add", "remove"]
//args[2] = effect ID or effect data
let target = game.actors.get(args[0]);
if (args[1] === "remove") {
  await target.deleteEmbeddedEntity("ActiveEffect", args[2]);
}
if (args[1] === "add") {
  await target.createEmbeddedEntity("ActiveEffect", args[2]);
}
