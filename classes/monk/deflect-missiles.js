let act = game.actors.get(args[0].actor._id);
let tok = canvas.tokens.get(args[0].tokenId);
async function deleteItemCard() {
  let card = game.messages.entities
    .reverse()
    .find(
      (message) =>
        message.data.flags["midi-qol"]?.actor === act.id &&
        message.data.flavor === args[0].item.name
    );
  await card.delete();
}
deleteItemCard();
let callback = game.macros.getName("DeflectMissilesCallback").execute(tok.id);
