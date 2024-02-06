const obj = require('../dist/index'),
    Grid = obj.Grid,
    Astar = obj.Astar;

// Create a grid
const grid = new Grid({
    col: 11,                  // col
    row: 7,                   // row
});

// Add obstacles to the grid
[[5, 2], [5, 3], [5, 4]].forEach(item => {
    grid.set(item, 'type', 1);    // Values greater than 0 are obstacles
});

const { col, row, data } = grid;

// Pass the grid as a parameter to the Astar object
const astar = new Astar(grid);
const path = astar.search(
    [0, 3],                   // start
    [10, 4],                  // end
    {
        rightAngle: false,    // default:false,Allow diagonal
        optimalResult: true   // default:true,In a few cases, the speed is slightly slower
    }
);

console.log('Result', path);

/*
[
  [ 0, 3 ],  [ 1, 3 ],
  [ 2, 3 ],  [ 3, 4 ],
  [ 4, 5 ],  [ 5, 5 ],
  [ 6, 5 ],  [ 7, 5 ],
  [ 8, 4 ],  [ 9, 4 ],
  [ 10, 4 ]
]
*/

/*
0 0 0 0 0 0 0 0 0 0 0 
0 0 0 0 0 0 0 0 0 0 0 
0 0 0 0 0 1 0 0 0 0 0 
2 2 2 0 0 1 0 0 0 0 0 
0 0 0 2 0 1 0 0 2 2 2 
0 0 0 0 2 2 2 2 0 0 0 
0 0 0 0 0 0 0 0 0 0 0
*/
path.forEach(item => {
    grid.set(item, 'type', 2);
});

for (let i = 0; i < row; i++) {
    let str = '';
    for (let j = 0; j < col; j++) {
        str += data[i][j].type + ' ';
    }
    console.log(str);
}