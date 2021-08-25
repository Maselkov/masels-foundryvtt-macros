let target = DAE.DAEfromUuid(args[0]).actor;
await target.updateEmbeddedDocuments("ActiveEffect", [
  {
    _id: args[1],
    ...args[2],
  },
]);
