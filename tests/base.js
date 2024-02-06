const obj = require('../dist/index'),
    Grid = obj.Grid,
    Astar = obj.Astar;

// Create a grid
let grid = new Grid({
        col:11,                  // col
        row:7,                   // row
        render:function(){       // Optional, this method is triggered when the grid point changes
            // console.log(this);
        }
    });

// Add obstacles to the grid
[[5,2],[5,3],[5,4]].forEach(item => {
    grid.set(item,'type',1);    // Values greater than 0 are obstacles
});

const { col, row, data } = grid;

// Pass the grid as a parameter to the Astar object
const astar = new Astar(grid);
const path = astar.search(
    [0,3],                   // start
    [10,4],                   // end
    {                        // option
        rightAngle:false,    // default:false,Allow diagonal
        optimalResult:true   // default:true,In a few cases, the speed is slightly slower
    }
);

path.forEach(item => {
    grid.set(item,'type',2);
});

console.log('Result',path);      // [[2,3],[3,2],[4,1],[5,1],[6,1],[7,2],[8,3]]

for(let i=0;i<row;i++){
    let str = '';
    for(let j=0;j<col;j++){
        str += data[i][j].type + ' ';
    }
    console.log(str);
}