let object = {
  "name": "Blade of Shadows",
  "type": "weapon",
  "img": "modules/plutonium/media/icon/spell/xge-shadow-blade.webp",
  "data": {
    "description": {
      "value": "If you drop the weapon or throw it, it dissipates at the end of the turn. Thereafter, while the spell persists, you can use a bonus action to cause the sword to reappear in your hand.",
    },
    "equipped": true,
    "activation": {
      "type": "action",
      "cost": 1
    },
    "range": {
      "value": 20,
      "long": 60,
      "units": "ft"
    },
    "actionType": "mwak",
    "damage": {
      "parts": [
        [
          null,
          "psychic"
        ]
      ]
    },
    "weaponType": "simpleM",
    "properties": {
      "fin": true,
      "lgt": true,
      "thr": true
    },
    "proficient": true
  },
  "flags": {
    "autoanimations": {
      "version": 1,
      "killAnim": false,
      "animLevel": false,
      "options": {
        "ammo": false,
        "meleeType": "weapon",
        "variant": "01",
        "repeat": 1,
        "delay": 250,
        "scale": 1,
        "enableCustom": false,
        "customPath": "",
        "rangeType": "weapon"
      },
      "override": true,
      "allSounds": {
        "item": {
          "enableAudio": false
        },
        "explosion": {
          "audioExplodeEnabled": false
        }
      },
      "sourceToken": {
        "enable": false
      },
      "targetToken": {
        "enable": false
      },
      "animType": "melee",
      "animation": "sword",
      "color": "purple",
      "meleeSwitch": {
        "switchType": "custom",
        "animation": "dagger",
        "variant": "01",
        "color": "darkpurple",
        "detect": "auto",
        "returning": false,
        "range": 2
      },
      "explosions": {
        "enable": true,
        "below": true,
        "radius": 1,
        "delay": null,
        "animation": "explosion",
        "variant": "01",
        "color": "purple",
        "enableCustom": false
      }
    }
  }
}
let flag = "shadowBladeUuid";

if (args[0] === "on") {
  let lastArg = args[args.length - 1];
  actor = DAE.DAEfromUuid(lastArg.actorUuid);
  let level = args[1]
  let diceCount = Math.min(Math.ceil(level / 2) + 1, 5);
  object.data.damage.parts[0][0] = `${diceCount}d8`;
  let items = await actor.createEmbeddedDocuments("Item", [object]);
  DAE.setFlag(actor, flag, items[0].uuid);
}

if (args[0] === "off") {
  let lastArg = args[args.length - 1];
  actor = DAE.DAEfromUuid(lastArg.actorUuid);
  let uuid = DAE.getFlag(actor, flag);
  let item = DAE.DAEfromUuid(uuid);
  item.delete();
  DAE.unsetFlag(actor, flag);
}
