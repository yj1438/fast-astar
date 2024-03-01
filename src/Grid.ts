import { Point } from './type';

/**
* 取指定范围的随机整数
* @param {number} <必选> min 最小数
* @param {number} <必选> max 最大数
* @return {number} 返回范围内的整数
*/
const randomInt = (min, max) => ~~(Math.random() * (max - min + 1)) + min;

/**
 * 节点类型：正常、障碍物
 */
export enum NodeType {
    NORMAL = 0, // 正常
    OBSTACLE = 1, // 障碍物
};

/**
 * 网格节点对象
 */
export class Node {

    // key: Point;
    x: number;
    y: number;

    type: NodeType = NodeType.NORMAL;
    parent: Node;
    
    /**
     * @override
     */
    // render: Function

    g: number = 0;
    h: number = 0;
    f: number;

    [key: string]: any // 自定义属性

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}

/**
 * 网格地图对象
 */
export class Grid {
    col: number; // 列，即宽
    row: number; // 行，即高
    data: Node[][];

    constructor(obj: { col: number, row: number, /*render?: Function */}) {
        const _ts = this;
        _ts.col = obj.col;      // 列，即宽
        _ts.row = obj.row;      // 行，即高
        _ts.data = _ts.createGrid(obj.col, obj.row, /* obj.render */);
    }

    /**
     * 获取地图指定位置的方法
     * @param {array} xy <必填> 任意节点坐标
     * @return {spot} 当前位置的网格点
     */
    get(xy: Point) {
        let row = this.data[xy[1]];
        return row ? row[xy[0]] : undefined;
    }

    /**
     * 地图设置方法
     * @param {array} xy <必填> 任意节点坐标
     * @param {string} key <必填> 需要设置的键
     * @param {any} val <必选> 设置项目的值
     */
    set(xy: Point, key: string, val: any) {
        let node = this.get(xy);
        if (!node) {
            return;
        }
        node[key] = val;
        // typeof node.render === 'function' && node.render.call(undefined, {
        //     key: key,
        //     val: val,
        //     x: xy[0],
        //     y: xy[1],
        // });
    }

    /**
     * 生成一个空的网格对象
     * @param {number} <必选> col 列，即宽
     * @param {number} <必选> row 行，即高
     * @return {object} 网格地图对象
     */
    createGrid(col: number, row: number, /* render?: Function */) {
        let result: Array<Node[]> = [];
        for (let i = 0; i < row; i++) {
            let rowItems: Node[] = [];
            for (let j = 0; j < col; j++) {
                let node = new Node(j, i);
                // if (typeof render === 'function') {
                //     node.render = render;
                //     render.call(undefined, {
                //         x: j,
                //         y: i,
                //     });
                // };
                rowItems[j] = node;
            };
            result.push(rowItems);
        };
        return result;
    }

    /**
     * for test
     * 为地图对象生成指定比例的障碍物
     * @param {number} scale <必选> 障碍物比例0-100
     * @param {number} type <必选> 障碍物类型，任意数字
     */
    obstacle(scale: number, type: NodeType = NodeType.OBSTACLE): Point[] {
        scale = scale > 1 ? 1 : scale < 0 ? 0 : scale;
        let amount: number = ~~(this.col * this.row * (scale)),
            xy: Point = [0, 0],
            maskMap;
        const result: Point[] = [];
        for (let i = 0; i < amount; i++) {
            (maskMap = () => {
                xy[0] = randomInt(0, this.col - 1);
                xy[1] = randomInt(0, this.row - 1);

                let item = this.get(xy);
                if (item && item.type === NodeType.NORMAL) {
                    item.type = type;
                    result.push([xy[0], xy[1]]);
                } else {
                    maskMap();
                };
            })()
        };
        return result;
    }
}
