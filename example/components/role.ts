import * as PIXI from 'pixi.js';
import roleImg from '../images/role.jpeg';
import { GRID_UNITY_WIDTH } from '../config';

export class Role extends PIXI.Container {
  name = 'role';

  app: PIXI.Application;

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
    this._draw();
  }

  _draw() {
    const sprite1 = PIXI.Sprite.from(roleImg);
    sprite1.width = GRID_UNITY_WIDTH;
    sprite1.height = GRID_UNITY_WIDTH;
    // sprite1.anchor.set(0.5);
    sprite1.position.set(0, 0);
    this.addChild(sprite1);
  }
}