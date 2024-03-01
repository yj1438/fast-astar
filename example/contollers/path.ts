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

  _runningFn: Function;

  constructor(app) {
    this.app = app;
    // astar
    const grid = new Grid({ row: 20, col: 10 });
    this.aStar = new Astar(grid, { optimalResult: true, onlyRightAngle: false });
  }

  draw(root: PIXI.Container) {
    // GridEntity
    const grid = new GridEntity(this.app, { rows: 20, cols: 10, unitPixel: GRID_UNITY_WIDTH });
    root.addChild(grid);
    this.grid = grid;
    // Grid obstacle，20%面积是障碍
    const obstacleList = this.aStar.grid.obstacle(0.2);
    for (let i = 0; i < obstacleList.length; i++) {
      const [x, y] = obstacleList[i];
      grid.cells[y][x].alpha = 0.2;
    }
    
    
    // RoleEntity
    const role = new RoleEntity(this.app);
    const { x, y } = grid.getRealPosition(0, 0);
    role.position.set(x, y);
    root.addChild(role);
    this.role = role;
    this._fromPoint = { row: 0, col: 0 };
    this._currentPoint = { row: 0, col: 0 };

    //
    this._bindEvent();
  }

  pathTo(data: GridPoint) {
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


    this.startRun();
  }

  startRun() {
    const ticker = this.app.ticker;
    if (this._runningFn) {
      ticker.remove(this._runningFn as any);
    }
    let currentPos = { x: this.role.position.x, y: this.role.position.y };
    let duration = 0;
    this._runningFn = (deltaTime: number) => {
      duration = duration + deltaTime * ticker.deltaMS;
      let per = duration / 500; // 每个小格跑500ms
      per = per > 1 ? 1 : per;
      const nextPoint = this._currentPath[0];
      if (nextPoint) {
        this.role.position.set(
          currentPos.x + per * (nextPoint[0] * GRID_UNITY_WIDTH - currentPos.x),
          currentPos.y + per * (nextPoint[1] * GRID_UNITY_WIDTH - currentPos.y),
        );
        if (per === 1) {
          currentPos = { x: nextPoint[0] * GRID_UNITY_WIDTH, y: nextPoint[1] * GRID_UNITY_WIDTH };
          this.grid.cells[nextPoint[1]][nextPoint[0]].alpha = 1;
          this._currentPath.shift();
          this._currentPoint = { row: nextPoint[1], col: nextPoint[0] };
          duration = 0;
        }
      }
    };
    ticker.add(this._runningFn as any);
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