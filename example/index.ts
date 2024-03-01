import { Application, Container } from 'pixi.js';
import { PathController } from './contollers/path';
console.log('hello world!');

// ---
const canvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
canvasElement.style.width = '100vw';
canvasElement.style.height = '100vh';

const app = new Application({
  view: canvasElement,
  width: 750,
  height: 1624,
  autoStart: true,
});

document.body.appendChild(app.view);

//
const root = new Container();
root.name = 'root';

app.stage.name = 'stage';
app.stage.addChild(root);

const path = new PathController(app);
path.draw(root);

window.app = app;