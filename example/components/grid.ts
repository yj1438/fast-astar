import * as PIXI from 'pixi.js';

export class Grid extends PIXI.Container {
  name = 'grid';

  app: PIXI.Application;

  rows: number;

  cols: number;

  unitPixel: number;

  cells: PIXI.Sprite[][] = [];

  _cellTexture: PIXI.Texture;

  _clickedCell: PIXI.Sprite;

  constructor(app: PIXI.Application, params: { rows: number, cols: number, unitPixel: number }) {
    super();
    this.app = app;
    this.rows = params.rows;
    this.cols = params.cols;
    this.unitPixel = params.unitPixel;
    this._draw();
    this._bindEvent();
  }

  getRealPosition(row: number, col: number, options: { center: boolean } = { center: false }) {
    const { unitPixel } = this;
    const x = col * unitPixel;
    const y = row * unitPixel;
    if (options.center) {
      return { x: x + unitPixel / 2, y: y + unitPixel / 2 };
    }
    return { x, y };
  }

  /**
   * @override
   */
  onClick(data: { row: number, col: number, cell: PIXI.Sprite }, event: PIXI.InteractionEvent) {
    // console.log('grid click', data.row, data.col);
  }

  _draw() {
    const { rows, cols, unitPixel } = this;
    const cellTexture = this._getCellTexture();

    for (let i = 0; i < rows; i++) {
      const row: PIXI.Sprite[] = [];
      for (let j = 0; j < cols; j++) {
        const cell = new PIXI.Sprite(cellTexture);
        cell.position.set(j * unitPixel, i * unitPixel);
        cell._row = i; // y
        cell._col = j; // x
        // text
        const text = new PIXI.Text(`${j},${i}`, { fontSize: 24, fill: 0xffffff });
        text.position.set(5, 5);
        cell.addChild(text);
        // on click
        cell.interactive = true;
        cell.on('tap', (event) => {
          // console.log('cell click', cell._row, cell._col);
          // if (this._clickedCell) {
          //   this._clickedCell.alpha = 1;
          // }
          // cell.alpha = 0.5;
          this._clickedCell = cell;
        });
        row.push(cell);
        this.addChild(cell);
      }
      this.cells.push(row);
    }
  }

  _getCellTexture() {
    if (!this._cellTexture) {
      var graphics = new PIXI.Graphics();
      graphics.lineStyle(1, 0xffffff, 1);
      graphics.beginFill(0x666666);
      graphics.drawRect(0, 0, this.unitPixel - 2, this.unitPixel - 2);
      graphics.endFill();
  
      this._cellTexture = this.app.renderer.generateTexture(graphics);
    }

    return this._cellTexture;
  }

  _bindEvent() {
    this.interactive = true;
    this.on('tap', (event) => {
      this.onClick({ row: this._clickedCell._row, col: this._clickedCell._col, cell: this._clickedCell }, event);
    });
  }
}
