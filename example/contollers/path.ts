import * as PIXI from 'pixi.js';
import { Astar, Grid, Point } from '../../src/index';
import { Grid as GridEntity } from '../components/grid';
import { Role as RoleEntity } from '../components/role';
import { GRID_UNITY_WIDTH } from '../config';

type GridPoint = { row: number, col: number };

export class PathController {

  app: PIXI.Application;

  aStar: Astar;

  grid: GridEntity;

  role: RoleEntity;

  _currentPoint: GridPoint;

  _currentPath: Point[];

  _fromPoint: GridPoint;

  _toPoint: GridPoint;

  constructor(app) {
    this.app = app;
  }

  draw(root: PIXI.Container) {
    //
    const grid = new GridEntity(this.app, { rows: 20, cols: 10, unitPixel: GRID_UNITY_WIDTH });
    root.addChild(grid);
    this.grid = grid;
    
    // 
    const role = new RoleEntity(this.app);
    const { x, y } = grid.getRealPosition(0, 0, { center: true });
    role.position.set(x, y);
    root.addChild(role);
    this.role = role;
    this._fromPoint = { row: 0, col: 0 };
    this._currentPoint = { row: 0, col: 0 };

    //
    this._bindEvent();
  }

  pathTo(data: GridPoint) {
    // astar
    this.aStar = new Astar(new Grid({ row: 20, col: 10 }), { optimalResult: true, onlyRightAngle: false });
    const fromPoint = this._fromPoint;
    const toPoint = data || this._toPoint;
    const pathArr = this.aStar.search(
      [fromPoint.col, fromPoint.row],
      [toPoint.col, toPoint.row], 
    );
    console.log(pathArr);

    if (this._currentPath) {
      for (let i = 0; i < this._currentPath.length; i++) {
        const [x, y] = this._currentPath[i];
        this.grid.cells[y][x].alpha = 1;
      }
    }
    // 绘制路径
    for (let i = 0; i < pathArr.length; i++) {
      const [x, y] = pathArr[i];
      this.grid.cells[y][x].alpha = 0.5;
    }

    this._currentPath = pathArr;
  }

  _bindEvent() {
    this.grid.onClick = ({ row, col, cell }) => {
      console.log('grid click', row, col);

      //
      if (this._toPoint) {
        this.grid.cells[this._toPoint.row][this._toPoint.col].alpha = 1;
      }
      this.grid.cells[row][col].alpha = 0.5;

      //
      this._toPoint = { row, col };
      this._fromPoint = this._currentPoint;
      this.pathTo({row, col});
    }
  }

}