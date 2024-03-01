import { Application, Container, Sprite } from 'pixi.js';
import img0 from '../images/img0.jpeg';

export class Eg1 extends Container {

  app: Application;

  constructor(app: Application) {
    super();
    this.app = app;
    //
    this._draw();
    //
    console.log('Eg1 created!');
  }

  _draw() {
    const sprite1 = Sprite.from(img0);
    sprite1.anchor.set(0.5);
    sprite1.position.set(375, 812);
    this.addChild(sprite1);

    let duration = 0;
    this.app.ticker.add((delta) => {
      duration = (duration + delta * this.app.ticker.deltaMS) % 4000;
      const pi = duration / 2000 * Math.PI;
      sprite1.position.set(Math.cos(pi) * 300 + 375, Math.sin(pi) * 300 + 812);

      this.sortChildren();
    });
  }
}