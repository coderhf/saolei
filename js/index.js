/*
 * @Author: fengHu
 * @Date: 2021-05-27 21:40:50
 * @LastEditTime: 2021-05-30 10:41:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \扫雷\js\index.js
 */

var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'sex', 'seven', 'eight']; // 存储每个数字的样式的class
// 获取显示雷的数量的变量元素
var container = document.getElementsByClassName('container')[0];
var mineNum = container.getElementsByClassName('mineNum')[0];
// 获取所有的button
var btns = document.getElementsByTagName('button');
var btnState = btns[0]; // 用来存储上一位点击的btn元素
var arr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];	//不同级别的行数列数雷数

// 创建一个地图构造函数
function Map(tr, td, mineNum) {
    this.tr = tr; // 创建地图的行数
    this.td = td; // 创建每一行的单元个数
    this.mineNum = mineNum; // 创建地图时地雷的个数
    this.squares = []; // 二维数组，来存储每个单元格上的所有信息（对象形式），以行列的形式来存取
    /*
    所希望的数据格式，如果时地雷，type为mine,并且xy为坐标；如果时数字，那么value是具体的数字
    {
        type : 'mine',
        x : 0
        y : 0
    }
    {
        type : 'number',
        x : 0,
        y : 0,
        value : 0
    }
    */
    this.tds = []; // 用来存储所有的单元格的DOM元素
    this.surplusMine = mineNum; // 剩余的地雷个数
    this.allRight = true; // 用来表示如果右击时找到的全是地雷，那么就说明游戏胜利，值变为true
    this.parent = document.getElementsByClassName('gameBox')[0];
}


// 创建地图的方法
Map.prototype.createDom = function () {
    var that = this;
    // this.clickTds = function(e) {
    //     var event = e || window.e;
    //     that.play(event, this);
    // }
    var table = document.createElement('table');
    for(var i = 0; i < this.tr; i++) {
        var tr = document.createElement('tr');
        this.tds[i] = [];
        for(var j = 0; j < this.td; j++) {
            var td = document.createElement('td');
            // td.innerHTML = '0';
            tr.appendChild(td);
            this.tds[i][j] = td;
            td.pos = [i,j]; // 给td属性，记录每一个单元格的坐标
            // 给每一个单元格添加点击事件
            td.onmousedown = function (e) {
                var event = e || window.e;
                that.play(event, this);
            };
            /*
            if (this.squares[i][j].type == 'mine') {
                td.className = 'mine';
            } else {
                td.innerHTML = this.squares[i][j].value;
            }
            */
        }
        table.appendChild(tr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

/**
 * @description: 生成n个不同的数字，代表地雷的位置
 * @param {*}
 * @return {*} square[]
 */
Map.prototype.randomNum = function () {
    var square = []; // 存储地雷位置的数组
    for(var i = 0; i < this.tr * this.td; i++) {
        square[i] = i;
    }
    // 随机排序
    square.sort(function () {
        return Math.random() - 0.5;
    })
    return square.slice(0, this.mineNum);
}

// 初始化函数
Map.prototype.init = function () {
    var mines = this.randomNum();  // 得到了地雷的位置标记信息
    var n = -1; // 做每个单元格的标记
    // 取消右键菜单默认事件
    this.parent.oncontextmenu = function () {
        return false;
    }
    mineNum.innerHTML = this.surplusMine;
    for(var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for(var j = 0; j < this.td; j++) {
            n ++;
            if (mines.indexOf(n) !== -1) {
                // 是地雷
                this.squares[i][j] = {
                    type : 'mine',
                    x : j,
                    y : i
                }
            } else {
                this.squares[i][j] = {
                    type : 'number',
                    x : j,
                    y : i,
                    value : 0
                }
            }
        }
    }
    this.updateNum();
    this.createDom();
    // this.getAround(this.squares[0][0])
    // console.log(this.squares);
}

// 找到地雷周围的数字
Map.prototype.getAround = function(square) {
    // 获取地雷的坐标
    var x = square.x;
    var y = square.y;
    var result = []; // 存储所有周围数字的坐标 [[1, 2],[2,3]]
    /*
    周围的坐标
        x-1,y-1  x,y-1  x+1,y-1
        x-1,y    x,y    x+1,y
        x-1,y+1  x,y+1  x+1,y+1
    */
    for(var i = x - 1; i <= x + 1; i++) {
        for(var j = y - 1; j <= y + 1; j++) {
            if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || (i == x && j == y)
                || (this.squares[j][i].type == 'mine')
            ) {
                continue;
            }
            result.push([j,i]);
        }
    }
    return result;
}

// 更新所有的数字的value
Map.prototype.updateNum = function () {
    for(var i = 0; i < this.tr; i++) {
        for(var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var aroundNum = this.getAround(this.squares[i][j]);
            // 改变地雷周围的数字value的值
            for(var k = 0; k < aroundNum.length; k++) {
                this.squares[aroundNum[k][0]][aroundNum[k][1]].value += 1;
            }
        }
    }
}

// 事件函数
Map.prototype.play = function (event, obj) {
    var square = this.squares[obj.pos[0]][obj.pos[1]]; // 获得当前单元格的信息
    // 左键点击
    if (event.which == 1 && obj.className !== 'flag') {
        // 判断是数字还是地雷
        if (square.type == 'number') {
            obj.innerHTML = square.value == 0 ? '' : square.value;
            obj.className = cl[square.value];
            // 实现用户点到空白的时候一出一大片
            /*
            1. 用户点击到有0的单元格，当前显示
            2. 查找四周，把所有的数字单元格信息记录起来，并且显示
            3. 遍历每一个为0的单元格
            4. 查找四周，把所有的数字单元格存储起来，并且显示
            5. 这是一个递归
            */
            square.value || showZero.call(this,square); // 当点击的单元格时0的时候进行调用这个函数
            // 显示所有连在一起的空白和数字
            function showZero(square) {
                // 查找四周单元格信息存储起来
                var res = this.getAround(square);
                var lastRes = [];
                // 把这些单元格信息在此检验，把是flag的信息抛出去
                for(var j = 0; j < res.length; j++) {
                    if (this.tds[res[j][0]][res[j][1]].className == 'flag') {
                        continue;
                    }
                    lastRes.push(res[j]);
                }
                for(var i = 0; i < lastRes.length; i++) {
                    // 获取每个单元格的坐标（行列）
                    var x = lastRes[i][0];
                    var y = lastRes[i][1];
                    // 显示单元格
                    this.tds[x][y].className = cl[this.squares[x][y].value];
                    // 遍历每一个为0的单元格进行查找
                    if (this.squares[x][y].value == 0) {
                        // 进行四周查找
                        // 为了避免重复的调用单元格，必须要给每一个要调用的单元格一个属性，如果有没有这个属性，就代表这个
                        // 单元格没有被调用，那就进行调用，并且将属性值该位true；如果有这个属性（值为true）那么就不调用
                        if (!this.tds[x][y].flag) {
                            this.tds[x][y].flag = true;
                            showZero.call(this,this.squares[x][y]);
                        }
                    } else {
                        // 是数字就显示出来
                        this.tds[x][y].innerHTML = this.squares[x][y].value;
                    }
                }
            }   
        } else {
            // 左键点击的是地雷游戏失败
            this.gameOver(obj);
            setTimeout(function () {
                alert('不好意思，游戏失败，请再接再厉');
            }, 20)
        }
    }
    // 右键点击
    if (event.which == 3) {
        // 当前的旗子显示，显示的旗子在点击将隐藏，以此切换；
        // 右键点击数字的时候，不会出现旗子
        if (obj.className && obj.className !== 'flag') {
            return;
        }
        obj.className = obj.className ? '' : 'flag';
        // 剩余雷数
        mineNum.innerHTML = obj.className == 'flag' ? --this.surplusMine : ++this.surplusMine; 
        // 判断旗子是否是与地雷相符合，如果全符合，那么就是true，只要有一个不对应，那么就是false
        if (obj.className == 'flag' && this.squares[obj.pos[0]][obj.pos[1]].type !== 'mine') {
            this.allRight = false;
        }
        // 当旗子被插完的时候，表示游戏结束，计算游戏结果
        if (this.surplusMine == 0) {
            if (this.allRight) {
                // 游戏赢了
                setTimeout(function () {
                    alert('恭喜您，游戏通过');                
                }, 0)
            } else {
                // 游戏失败
                setTimeout(function () {
                    alert('不好意思，游戏失败，请再接再厉');
                },0)
                this.gameOver();
            }
        }
    }
}

// 游戏失败方法
Map.prototype.gameOver = function(clickTd) {
    /*
    1. 显示所有的雷
    2. 取消所有单元格点击事件
    3. 当前这个单元格背景变为红色
    */
    for(var i = 0; i < this.tr; i++) {
        for(var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                // 显示地雷的单元格
                this.tds[i][j].className = 'mine';
            }
            // 取消所有单元格的事件函数
            this.tds[i][j].onmousedown = null;
        }
    }
    // 当前元素背景变为红色
    clickTd && (clickTd.style.backgroundColor = '#f00');
}

/*
var map = new Map(9, 9, 10);
map.init();
*/
// 给所有button事件,除最后一个btn
for(var i = 0; i < btns.length - 1; i++) {
    (function (i) {
        btns[i].onclick = function () {
            btnState.className = '';
            this.className = 'active';
            btnState = this;
            new Map(...arr[i]).init();
        }
    })(i)
}
// 初始化
btns[0].onclick();

// 重新开始
btns[3].onclick = function () {
    btns[0].onclick();
}