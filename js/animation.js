/**
 * Created by ptrbdr on 03.01.19.
 */
var renderer = PIXI.autoDetectRenderer(800, 600, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();

graphics.lineStyle(20, 0x33FF00);

stage.addChild(graphics);

animateXX();

var p = 0; // Percentage

function animateXX() {
    // console.log(p);
    // if (p < 1.00)  {
        // while we didn't fully draw the line
        p += 0.01; // increase the "progress" of the animation

        graphics.clear();
        graphics.lineStyle(20, 0x33FF00);
        graphics.moveTo(30,30);

        console.log(p);
        console.log((600 - 30)*p);


        // This is the length of the line. For the x-position, that's 600-30 pixels - so your line was 570 pixels long.
        // Multiply that by p, making it longer and longer. Finally, it's offset by the 30 pixels from your moveTo above. So, when p is 0, the line moves to 30 (not drawn at all), and when p is 1, the line moves to 600 (where it was for you). For y, it's the same, but with your y values.
        graphics.lineTo((600)*p, (300)*p);


        renderer.render(stage);
        requestAnimationFrame( animateXX );
    // }
    // else {
    //     return
    // }
}