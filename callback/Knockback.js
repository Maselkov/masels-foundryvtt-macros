// Script Macro, Execute Macro as GM
//await knockback(canvas.tokens.controlled[0],Array.from(game.user.targets)[0],10);
// Very uglily modified knockback macro from foundry's discord that adds collission support
let ptoken = canvas.tokens.get(args[0]);
let ttoken = canvas.tokens.get(args[1]);
let distance = Number(args[2]);
const x1 = ptoken.center.x;
const x2 = ttoken.center.x;
const y1 = ptoken.center.y;
const y2 = ttoken.center.y;
let angcoeff = Math.abs((y2 - y1) / (x2 - x1));
if (angcoeff > 1) angcoeff = 1 / angcoeff;
const unitDistance = distance + (distance * Math.sqrt(2) - distance) * angcoeff;
const gridUnit = canvas.scene.data.grid;
distance = (distance * canvas.scene.data.grid) / canvas.scene.data.gridDistance;

function getXy(x) {

    return (y2 - y1) * (x - x1) / (x2 - x1) + y1;

}
function getYx(y) {

    return (x2 - x1) * (y - y1) / (y2 - y1) + x1;

}
async function findDestination() {
    const scenew = canvas.dimensions.width;
    const sceneh = canvas.dimensions.height;
    const sx = ptoken.center.x == ttoken.center.x;
    const used = sx ? sceneh : scenew;
    let coordinatesArray = [];
    for (let i = 0; i <= used; i += 1) {

        let t = sx ? getYx(i) : getXy(i);
        let snapCoord = sx ? await canvas.grid.getCenter(t, i) : await canvas.grid.getCenter(i, t);
        let cdist = await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ttoken.center);
        if (await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ptoken.center) > await canvas.grid.measureDistance(ttoken.center, ptoken.center)) {
            if (!ttoken.checkCollision(new PIXI.Point(snapCoord[0], snapCoord[1]))) {
                if (sx) {
                    coordinatesArray.push({ "x": t, "y": i, "dist": cdist });
                }
                else {
                    coordinatesArray.push({ "x": i, "y": t, "dist": cdist });
                }

            }
        }

    }
    return coordinatesArray;

}
const negativeY = ptoken.center.y - ttoken.center.y > 0
const negativeX = ptoken.center.x - ttoken.center.x > 0
let fdest = await findDestination();
if (!fdest.length) {
    return;
}
console.log(fdest);
fdest = fdest.filter((point) => {
    if (negativeX) {
        if (point.x - x1 > 0) { return false };
    }
    else {
        if (point.x - x1 < 0) { return false };
    }
    if (negativeY) {
        if (point.y - y1 > 0) { return false }
    }
    else {
        if (point.y - y1 < 0) { return false }
    }
    return true;
})
if (!fdest.length) {
    return;
}
let coord = fdest.reduce(function (prev, curr) {
    return (Math.abs(curr.dist - unitDistance) < Math.abs(prev.dist - unitDistance) ? curr : prev);
});
fdest = await canvas.grid.getSnappedPosition(coord.x - gridUnit / 2, coord.y - gridUnit / 2, 1);
await ttoken.update(fdest);
