import { Grid, Node, NodeType } from './Grid';
import { Point } from './type';

const vector2ToKey = (v: Point) => v.toString();
const keyToVector2 = (k: string) => k.split(',').map(Number);

export type AstarOptions = {
    onlyRightAngle: boolean,
    optimalResult: boolean
}

/**
 * A*寻路算法
 */
export class Astar {
    grid: Grid;
    searchOption: AstarOptions = {
        onlyRightAngle: true,
        optimalResult: true
    };
    // current: any;
    start: Point;
    end: Point;
    _openList: Map<string, boolean>;
    _closeList: Map<string, boolean>;

    constructor(grid: Grid, option?: AstarOptions) {
        this.grid = grid;                                                                   // 保存传入地图网格
        this.searchOption = Object.assign({}, this.searchOption, option || {});
    }

    /**
     * 寻找路径
     * @param  {Point} start <必填>，起始位置（[x,y]）
     * @param  {Point} end <必填>，结束位置（[x,y]）
     * @return {array}  返回寻找到的路径
     */
    search(start: Point, end: Point) {

        this._openList = new Map();                                                                   // 开启列表
        this._closeList = new Map(); 

        this.start = start; // 记录开始点
        this.end = end; // 记录结束点

        const startNode = this.grid.get(start);
        const endNode = this.grid.get(end);

        if (startNode === undefined || endNode === undefined) {
            throw new Error('起点或终点不存在');
        }
        if (startNode.value === NodeType.OBSTACLE || endNode.value === NodeType.OBSTACLE) {
            throw new Error('起点或终点不可达');
        }

        startNode.tag = 'start';
        endNode.tag = 'end';

        // 将起点加入到开启列表
        this._openList.set(vector2ToKey(start), true);
        let result,
            isContinue = true;                                                                      // 标记是否继续查找节点

        console.log('开始寻路', start, end);

        // 定义搜索方法并从起点开始寻找
        const searchFn = (p: Point): void => {
            const node = this.grid.get(p);
            if (!node) {
                return;
            }

            // node.open = 1; // custom property
            // 如果当前节点即结束节点，则说明找到终点
            if (node === endNode) {
                isContinue = false;
                result = this.getBackPath(node);
                // console.log('找到结束点',result);
            } else {
                let aroundPoints = this.getAroundPoints(p);                                               // 得到四周有用的节点

                // 将四周有用的节点添加到开启列表
                for (let i = 0, len = aroundPoints.length; i < len; i++) {
                    let _p = aroundPoints[i],
                        _node = this.grid.get(_p),
                        itemKey = vector2ToKey(_p);
                    

                    if (!_node) {
                        continue;
                    }

                    const g = this.g(_p, p);
                    const h = this.h(_p, this.end);
                    const f = this.f(_p);
                    // 如果网格不存在开启列表，则加入到开启列表并把选中的新方格作为父节点及计算其g、f、h值
                    if (!this._openList.get(itemKey)) {
                        this._openList.set(itemKey, true);
                        _node.g = g;
                        _node.h = h;
                        _node.f = f;
                        _node.parent = node;
                        // _ts.grid.set(item, 'type', 'open');
                    }
                    // 如果已经在开启列表里了，则检查该条路径是否会更好
                    // 检查新的路径g值是否会更低，如果更低则把该相邻方格的你节点改为目前选中的方格并重新计算其g、f、h
                    else {
                        if (g < _node.g) {
                            _node.g = g;
                            _node.h = h;
                            _node.f = f;
                            _node.parent = node;
                            // _ts.grid.set(item, 'type', 'update');
                        };
                    };
                };
                // 从开启列表中删除点A并加入到关闭列表
                let nodeKey = vector2ToKey(p);
                this._openList.delete(nodeKey);
                this._closeList.set(nodeKey, true);
                // _ts.grid.set(node, 'type', 'close');
            }
        };

        searchFn(start);

        while (isContinue) {
            // 从开启列表中寻找最小的F值的项，并将其加入到关闭列表
            let minNode = this.getOpenListMin();
            if (minNode) {
                searchFn([minNode.x, minNode.y]);
            } else {
                isContinue = false;
            };
        };
        return result;
    }

    /**
     * 回溯路径
     */
    getBackPath(node: Node) {
        let result: Array<Point> = [];
        while (node) {
            result.unshift([node.x, node.y]);
            node = node.parent;
        };
        return result;
    }

    /**
     * 获取打开列表中，f值最小的索引值的项
     * @return {object|undefined} 返回打开列表中，f值最小的索引值
     */
    getOpenListMin() {
        let data: Node | undefined;
        this._openList.forEach((value, key) => {
            let point = keyToVector2(key) as Point,
                node = this.grid.get(point);
            if (!data || node && node?.f < data.f) {
                data = node;
            };
        });
        return data;
    }

    /**
     * 获取指定网格的偏移目标
     * @param grid 网格坐标
     * @param offset 偏移位置
     * @return 得到偏移的网格坐标
     */
    getOffsetGrid(grid: Point, offset: [number, number]): Point {
        let x = grid[0] + offset[0],
            y = grid[1] + offset[1];
        return [x, y];
    }

    /**
     * 获取当前节点四周的有效节点
     * @param  {array} grid <必填> 任意节点坐标
     * @return {array} 有效的节点列表
     */
    getAroundPoints(xy: Point) {
        const searchOption = this.searchOption,
            grid = this.grid,
            lt: Point = [-1, -1],
            t: Point = [0, -1],
            rt: Point = [1, -1],
            r: Point = [1, 0],
            rb: Point = [1, 1],
            b: Point = [0, 1],
            lb: Point = [-1, 1],
            l: Point = [-1, 0];

        const around: Array<Point> = [];
        const result: Point[] = [];
        
        // 不是障碍物
        const isNoObstacle = (xy: Point, offset: [number, number]) => {
            let neighbor = grid.get(this.getOffsetGrid(xy, offset));
            return neighbor && neighbor.type === NodeType.NORMAL ? true : false;
        };

        let l_isNoObstacle = isNoObstacle(xy, l),                                                // 左边无障碍物
            r_isNoObstacle = isNoObstacle(xy, r),                                                // 右边无障碍物
            t_isNoObstacle = isNoObstacle(xy, t),                                                // 上方无障碍物
            b_isNoObstacle = isNoObstacle(xy, b);

        // 上右下左
        l_isNoObstacle && around.push(l);
        r_isNoObstacle && around.push(r);
        t_isNoObstacle && around.push(t);
        b_isNoObstacle && around.push(b);

        // 如果是可以斜角（非直角）则需要将交叉格子添加到四周检测列表中
        if (!searchOption.onlyRightAngle) {
            // 左上
            if (l_isNoObstacle && t_isNoObstacle) {
                around.push(lt);
            };
            // 左下
            if (l_isNoObstacle && b_isNoObstacle) {
                around.push(lb);
            };
            // 右上
            if (r_isNoObstacle && t_isNoObstacle) {
                around.push(rt);
            };
            // 右下
            if (r_isNoObstacle && b_isNoObstacle) {
                around.push(rb);
            };
        };

        for (let i = 0, len = around.length; i < len; i++) {
            let item = around[i],
                _xy: Point = this.getOffsetGrid(xy, item),
                _xyKey = vector2ToKey(_xy),
                isNotClose = !this._closeList.get(_xyKey);
            if (
                _xy[0] >= 0 && _xy[0] < grid.col &&                                                 // 判断水平边界
                _xy[1] >= 0 && _xy[1] < grid.row &&                                                 // 判断纵向边界
                isNotClose                                                             // 判断地图无障碍物（是可移动区域）
            ) {
                result.push(_xy);
            };
        };
        return result;
    }

    /**
     * 得到当前节点的权重
     * @param {array} grid <必填> 需要计算的节点
     */
    f(point: Point) {
        const item = this.grid.get(point);
        return item ? (item.g + item.h) : Infinity;
    }

    /**
     * 从start到指定网络的移动成本（垂直、水平返回1，斜角返回1.4）
     * @param  {array} grid <必填>，子起点位置（[x,y]）
     * @param  {array} parent <必填>，父起点位置（[x,y]）
     * @return {number} 移动成本
     */
    g(point: Point, parent: Point) {
        return this.searchOption.optimalResult
            ? (parent[0] === point[0] || parent[1] === point[1] ? 1 : 1.4) + (this.grid?.get(parent)?.g || 0)
            : 0;
    }

    /**
     * 获取至目标点的估计移动成本（使用曼哈顿方法获取）
     * @param {array} 起始位置，x:number,y:number
     * @param {array} 结束位置，x:number,y:number
     * @return {number} 估计移动成本(曼哈顿值)
     */
    h(point: Point, end: Point) {
        return (Math.abs(point[0] - end[0]) + Math.abs(point[1] - end[1]));
    }
};