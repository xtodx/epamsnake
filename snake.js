$(document).ready(function() {
  chatWebSocket();
});
String.prototype.indexOfArray = function(array) {
  var str = this;
  var ret = false;
  array.forEach(function(el) {
    var ind = str.indexOf(el);
    if (ind + 1) {
      ret = [ind, el];
      return true;
    }
  });
  return ret;
};

var socket;
var URL = 'https://game2.epam-bot-challenge.com.ua/codenjoy-contest/board/player/tonylovepony@gmail.com?code=528051571629643063';
var COMMANDS = ['LEFT', 'RIGHT', 'DOWN', 'UP', 'ACT'];
var matrix = [];
var wawes = [];

var head = [0, 0]; // y, x
var step;

var headSymbols = ['◄', '►', '▲', '▼'];
var headTo = '►';
var okSymbols = [' ', '○', '$', '®', '©', '◄', '►', '▲', '▼'];
var eatSymbols = ['○', '$'];

function chatWebSocket() {
  var ws = URL.replace('http', 'ws').
      replace('board/player/', 'ws?user=').
      replace('?code=', '&code=');
  console.log('Connection to ' + ws);
  socket = new WebSocket(ws);
  socket.onopen = function(evt) {
    onOpen(evt);
  };
  socket.onclose = function(evt) {
    onClose(evt);
  };
  socket.onmessage = function(evt) {
    onMessage(evt);
  };
  socket.onerror = function(evt) {
    onError(evt);
  };
}

function onOpen(evt) {
  console.log('Success connection');
  //doSend({name: 'getScreen', allPlayersScreen: false, players: [email]});
}

function onClose(evt) {
  socket.close();
  setTimeout(chatWebSocket, 10000);
}

function onMessage(evt) {
  var data = evt.data.replace('board=', '');
  parseData(data);
}

function parseData(data) {
  step = Math.sqrt(data.length);
  var hd = data.indexOfArray(headSymbols);
  if (hd) {
    head[0] = Math.floor(hd[0] / step);
    head[1] = hd[0] % step;
    headTo = hd[1];
    matrix = [];
    for (var i = 0, charsLength = data.length; i < charsLength; i += step) {
      matrix.push(data.substring(i, i + step));
    }
    var lee = new Lee();
    lee.checkPoints([[head[0], head[1]]]);
    console.log('EAT ON ' + lee.getCoords());
    var cell = lee.getCell();
    doSend(getCommand(cell));
  }
  printData();
}

function getCommand(cell) {
  if (cell[0] > head[0]) {
    return COMMANDS[2];
  } else if (cell[0] < head[0]) {
    return COMMANDS[3];
  } else if (cell[1] > head[1]) {
    return COMMANDS[1];
  } else if (cell[1] < head[1]) {
    return COMMANDS[0];
  }
}

function printData() {
  $('.board').html('');
  var br = '<br>';
  matrix.forEach(function(row) {
    $('.board').append(row + br);
  });
}

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}

function onError(evt) {
  socket.close();
}

function doSend(message) {

  socket.send(message);
}

function Lee() {
  var bEnd = false;
  var coords = [];
  for (var ii = 0; ii < step; ii++) {
    wawes[ii] = [];
    for (var kk = 0; kk < step; kk++) {
      wawes[ii][kk] = step * 2;
    }
  }
  this.checkLimit = function(x, y) {
    if (x >= 0 && x < step && y >= 0 && y < step)
      return true;
    else
      return false;
  };

  this.checkPointObstacle = function(x, y) {
    if (okSymbols.indexOf(matrix[y][x]))
      return true;
    else
      return false;
  };
  this.checkEndPoint = function(x, y) {
    if (eatSymbols.indexOf(matrix[y][x]))
      return true;
    else
      return false;
  };
  this.getCoords = function() {
    return coords;
  };
  this.getCell = function() {
    return this.returnToStart(coords);
  };
  var itterations = 0;
  this.returnToStart = function(point) {
    console.log(itterations++);
    console.log(point[0] + ' | ' + point[1]);
    var mcrd = [0,0];
    var minimal = wawes[point[0]][point[1]];
    for (var y = -1; y <= 1; ++y)
      for (var x = -1; x <= 1; ++x)
        if (!(x == 0 && y == 0) && (x == 0 | y == 0))
        //проверка на выход за пределы поля
          if (this.checkLimit(point[1] + x, point[0] + y))
            if (wawes[point[0] + y][point[1] + x] < minimal) {
              mcrd = [point[0] + y, point[1] + x];
            } else {
              console.log(wawes[point[0] + y][point[1] + x] + '>' + minimal);
            }
    if (minimal == 1) {
      return mcrd;
    } else {
      return this.returnToStart(mcrd);
    }
  };
  this.checkPoints = function(p) {
    var count = p.length;
    var points = new Array();
    //если закончен расчёт, тикаем
    if (count == 0 || bEnd) return;
    //обходим точки
    for (var i = 0; i < count; ++i) {
      //если достигли конца, то тикаем
      if (this.checkEndPoint(p[i][1], p[i][0])) {
        bEnd = true;
        coords[0] = p[i][0];
        coords[1] = p[i][1];
        return;
      }
      //проверяем окружные 4 клеток
      for (var y = -1; y <= 1; ++y)
        for (var x = -1; x <= 1; ++x)
          if (!(x == 0 && y == 0) && (x == 0 | y == 0))
          //проверка на выход за пределы поля
            if (this.checkLimit(p[i][1] + x, p[i][0] + y))
            //проверка на препятствия
              if (this.checkPointObstacle(p[i][1] + x, p[i][0] + y)) {
                //проверка на краткость пути
                if (wawes[p[i][0] + y][p[i][1] + x] > wawes[p[i][0]][p[i][1]] +
                    1) {
                  wawes[p[i][0] + y][p[i][1] + x] = wawes[p[i][0]][p[i][1]] + 1;
                  points[points.length] = [p[i][0] + y, p[i][1] + x];
                }
              }
    }
    //повторяем для новых клеток
    this.checkPoints(points);
  };

}