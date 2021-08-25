//args[0] = token uuid
//args[1] = ["add", "remove"]
//args[2] = effect ID or effect data
let target = DAE.DAEfromUuid(args[0]).actor;
if (args[1] === "remove") {
  await target.deleteEmbeddedDocuments("ActiveEffect", [args[2]]);
}
if (args[1] === "add") {
  await target.createEmbeddedDocuments("ActiveEffect", [args[2]]);
}
