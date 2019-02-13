$(document).ready(function() {
  snakeWebSocket();
  setInterval(reloadPage, 3000000);
});

function reloadPage() {
  window.location.reload(true);
}

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

Array.prototype.indexArrayInArray = function(array) {
  var ret = -1;
  this.forEach(function(el, i) {
    if (el.join(',') == array.join(',')) {
      ret = i;
      return i;
    }
  });
  return ret;
};
String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement +
      this.substr(index + replacement.length);
};
String.prototype.getAllIndexes = function getAllIndexes(val) {
  var indexes = [], i = -1;
  while ((i = this.indexOf(val, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
};

var socket;
var COMMANDS = ['LEFT', 'RIGHT', 'DOWN', 'UP', 'ACT'];
var matrix = [];
var wawes = [];
var length = 0;
var head = [0, 0]; // y, x
var tail = [30, 30];
var snake = [];
var napr = 'RIGHT';
var step;
var costs = [];
var URL = '';

costs['○'.charCodeAt(0)] = 500;
costs['$'.charCodeAt(0)] = 700;
costs['®'.charCodeAt(0)] = 600;
costs['©'.charCodeAt(0)] = 100;
costs['●'.charCodeAt(0)] = 500;
costs['˅'.charCodeAt(0)] = 500;
costs['<'.charCodeAt(0)] = 500;
costs['>'.charCodeAt(0)] = 500;
costs['˄'.charCodeAt(0)] = 500;
costs['─'.charCodeAt(0)] = 300;
costs['│'.charCodeAt(0)] = 300;
costs['┐'.charCodeAt(0)] = 300;
costs['┘'.charCodeAt(0)] = 300;
costs['┌'.charCodeAt(0)] = 300;
costs['└'.charCodeAt(0)] = 300;
costs[' '.charCodeAt(0)] = 1; //Сделал завышенные коэфициенты, и добавил пробел в символы "еда", чтоб если нет подходящей еды, мы ехали в ближайший пустой блок, но не убиваться об стену же. Лучше пусть другие умирают.

var status = 'ok';
var maskTime = 0;
var dopcom = false;
var enemies = [];
var symbols = {
  'ok': [
    ' ',
    '○',
    '$',
    '®',
    '©',
    '◄',
    '►',
    '▲',
    '▼',
    '♥',
    '♠',
    '♣',
    '╙',
    '╘',
    '╓',
    '╕'],
  'big': [
    ' ',
    '○',
    '●',
    '$',
    '®',
    '©',
    '◄',
    '►',
    '▲',
    '▼',
    '♥',
    '♠',
    '╙',
    '╘',
    '╓',
    '╕'],
  'fury': [
    ' ',
    '○',
    '●',
    '$',
    '®',
    '©',
    '◄',
    '►',
    '▲',
    '▼',
    '♥',
    '♠',
    '˅',
    '<',
    '>',
    '˄',
    '¤',
    '×',
    'æ',
    'ö',
    '─',
    '│',
    '┐',
    '┘',
    '┌',
    '└',
    '╙',
    '╘',
    '╓',
    '╕'],
  'fly': [
    ' ',
    '○',
    '$',
    '®',
    '©',
    '●',
    '◄',
    '►',
    '▲',
    '▼',
    '♥',
    '♠',
    '˅',
    '<',
    '>',
    '˄',
    '¤',
    '×',
    'æ',
    'ö',
    '─',
    '│',
    '┐',
    '┘',
    '┌',
    '└',
    '╙',
    '╘',
    '╓',
    '╕'],
};
var eatSymbols = {
  'ok': [' ', '○', '$', '®', '©'],
  'fly': [' ', '○', '$', '®', '©'],
  'big': [' ', '○', '●', '$', '®', '©'],
  'fury': [
    ' ',
    '®',
    '●',
    '˅',
    '<',
    '>',
    '˄',
    '─',
    '│',
    '┐',
    '┘',
    '┌',
    '└'],
};
var stone = '●';
var apple = '○';
var prevObj = '○';
var stones = 0;
var bigLength = 5;
var snakeSymbols = ['╙', '╘', '╓', '╕', '═', '║', '╗', '╝', '╔', '╚'];
var tailSymbols = ['╙', '╘', '╓', '╕'];
var enemySymbols = ['¤', '×', 'æ', 'ö', '─', '│', '┐', '┘', '┌', '└'];
var enemyHeads = ['˅', '<', '>', '˄', '♣', '♦'];
var neck = '╬';
var danger = '₷';
var headSymbols = ['◄', '►', '▲', '▼', '♥', '♠'];
var fly = '♠';
var fury = '♥';
var maskFury = '®';
var maskFly = '©';
var zagon = '#';
var wall = '☼';
var gold = '$';
var smile = '☺';

var printSymbols = [];

//генерация символов для вывода
printSymbolsGenerator(enemySymbols, 'enemy');
printSymbolsGenerator(enemyHeads, 'enemyh');

printSymbolsGenerator(snakeSymbols, 'snake');
printSymbolsGenerator(headSymbols, 'head');

printSymbolsGenerator(stone, 'stone');
printSymbolsGenerator(apple, 'apple');
printSymbolsGenerator(gold, 'gold');

printSymbolsGenerator(maskFury, 'maskFury');
printSymbolsGenerator(maskFly, 'maskFly');

printSymbolsGenerator(neck, 'neck');
printSymbolsGenerator(danger, 'danger');

printSymbolsGenerator(zagon, 'zagon');
printSymbolsGenerator(wall, 'wall');
printSymbolsGenerator(smile, 'smile');

printSymbolsGenerator(' ', 'background');
printSymbolsGenerator('*', 'wall');
printSymbolsGenerator('ø', 'wall');
printSymbolsGenerator('&', 'wall');
printSymbolsGenerator('~', 'wall');

function printSymbolsGenerator(array, clas) {
  if (Array.isArray(array))
    array.forEach(function(obj, i) {
      printSymbols[obj.charCodeAt(0)] = clas + i;
    });
  else
    printSymbols[array.charCodeAt(0)] = clas;
}

function snakeWebSocket() {
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
  setTimeout(snakeWebSocket, 1000);
}

function onMessage(evt) {
  var data = evt.data.replace('board=', '');
  try {
    parseData(data);
  } catch (e) {
    console.log(e);
    console.log(matrix);
  }
}

function onError(evt) {
  socket.close();
}

function doSend(message) {

  socket.send(message);
}

function parseData(data) {
  step = Math.sqrt(data.length);
  if (maskTime > 0)
    maskTime--;
  matrix = [];
  for (var i = 0, charsLength = data.length; i < charsLength; i += step) {
    matrix[matrix.length] = data.substring(i, i + step);
  }
  var hd = data.indexOfArray(headSymbols);
  findSnake(data);
  console.log('LENGTH = ' + length);

  if (prevObj == stone) {
    stones++;
  }
  setStatus(data);
  if (hd) {
    head[0] = Math.floor(hd[0] / step);
    head[1] = hd[0] % step;
    var tl = data.indexOfArray(tailSymbols);
    tail[0] = Math.floor(tl[0] / step);
    tail[1] = tl[0] % step;

    blockAfterHead(head);
    setDopTail();
    var efinder = new EnemiesFinder();
    efinder.find(data);
    efinder = null;
    var finder = new PathFinder();
    console.log('Finding...');
    wawes[head[0]][head[1]] = 0;
    finder.checkPoints([[head[0], head[1]]]);
    console.log('EAT ON ' + finder.getCoords());
    var cell = finder.getCell();
    finder = null;
    if (matrix[cell[0]][cell[1]] == maskFury) {
      maskTime = 10;
    } else if (matrix[cell[0]][cell[1]] == maskFly) {
      maskTime = 10;
    }
    if (cell) {
      console.log('Command :)');
      setDopCommand(cell);
      doSend(getCommand(cell));
    } else {
      console.log('NO COMMAND :(');
      doSend('NONE');
    }
  } else {
    stones = 0;
    doSend('NONE');
  }
  setTimeout(printData, 1);
}

function findSnake(data) {
  length = 1;
  snake = [];
  snakeSymbols.forEach(function(sym) {
    var snpos = data.indexOf(sym);
    if (snpos != -1) {
      length += (data.split(sym).length - 1);
      var sn = [];
      sn[0] = Math.floor(snpos / step);
      sn[1] = snpos % step;
      snake[snake.length] = sn;
    }
  });
}

function setDopTail() {
  if (status == 'fury' && length > 2 && stones > 0) {
    matrix[tail[0]] = matrix[tail[0]].replaceAt(tail[1], stone);
  }
}

function setDopCommand(cell) {
  dopcom = false;
  if (stones > 0 && (status == 'fury' &&
      (cell.join(',') == tail.join(',') || length < 3))) {
    dopcom = COMMANDS[4];
    stones--;
  } else {
    if (status == 'fury') {
      console.log('NO STONE WTF');
      console.log(stones);
      console.log(length);
      console.log(cell.join(','));
      console.log(tail.join(','));
      console.log(cell.join(',') == tail.join(','));
    }
  }
}

function blockAfterHead(point) {
  if (napr == 'DOWN') {
    matrix[point[0] - 1] = matrix[point[0] - 1].replaceAt(point[1], neck);
  } else if (napr == 'UP') {
    matrix[point[0] + 1] = matrix[point[0] + 1].replaceAt(point[1], neck);
  } else if (napr == 'LEFT') {
    matrix[point[0]] = matrix[point[0]].replaceAt(point[1] + 1, neck);
  } else {
    matrix[point[0]] = matrix[point[0]].replaceAt(point[1] - 1, neck);
  }
}

function setStatus(data) {
  if (data.indexOf(fury) + 1 && maskTime > 0) {
    status = 'fury';
  } else if (data.indexOf(fly) + 1 && maskTime > 0) {
    status = 'fly';
  } else if (biggerLength()) {
    status = 'big';
  } else {
    status = 'ok';
  }
}

function biggerLength() {
  var max = bigLength;
  if (prevObj == stone) {
    max += bigLength;
  }
  enemies.forEach(function(e) {
    if (e.length > max)
      max = e.length;
  });
  if (length > (max + 3))
    return true;
  else
    return false;
}

function getCommand(cell) {
  prevObj = matrix[cell[0]][cell[1]];
  var com = '';
  if (cell[0] > head[0]) {
    com = COMMANDS[2];
  } else if (cell[0] < head[0]) {
    com = COMMANDS[3];
  } else if (cell[1] > head[1]) {
    com = COMMANDS[1];
  } else if (cell[1] < head[1]) {
    com = COMMANDS[0];
  } else {
    com = 'NONE';
  }
  if (com != 'NONE')
    napr = com;
  if (dopcom)
    com += ',' + dopcom;
  return com;
}

function printData() {
  $('.enemy').removeClass('enemy');
  matrix.forEach(function(row, i) {
    row = row.split('');
    row.forEach(function(sym, k) {
      $('#c-' + i + '-' + k).html(sym);
      if (printSymbols[sym.charCodeAt(0)]) {
        $('#c-' + i + '-' + k).
            css({
              'background-image': 'url(\'img/' +
              printSymbols[sym.charCodeAt(0)] +
              '.png\')',
            });
      } else {
        console.log(sym);
      }
    });
  });
  $('#stones').html(stones);

}

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}

function checkLimit(x, y) {
  if (x >= 0 && x < step && y >= 0 && y < step)
    return true;
  else
    return false;
}

function EnemiesFinder() {
  var coords = [];
  var that = this;
  var allCoords = [];
  this.find = function(data) {
    enemies = [];
    enemyHeads.forEach(function(el) {
      var indexes = data.getAllIndexes(el);
      indexes.forEach(function(el) {
        coords = [];
        var enemy = [];
        enemy[0] = [];
        enemy[0][0] = Math.floor(el / step);
        enemy[0][1] = el % step;
        var ends = that.findEnemy(enemy[0]);
        enemy = enemy.concat(ends);
        enemies[enemies.length] = enemy;
        that.blockBigSnakes(enemy[0], enemy.length);
      });
    });
    return enemies;
  };
  this.blockBigSnakes = function(eHead, eLength) {
    if ((eLength + 2 >= length && status != 'fury') ||
        (matrix[eHead[0]][eHead[1]] == '♣' && (status != 'fury' ||
            (status == 'fury' && eLength + 2 >= length)))) {
      for (var y = -1; y <= 1; ++y)
        for (var x = -1; x <= 1; ++x)
          if (!(x == 0 && y == 0) && (x == 0 || y == 0))
            if (checkLimit(eHead[1] + x, eHead[0] + y) &&
                matrix[eHead[0] + y][eHead[1] + x] == ' ') {
              matrix[eHead[0] + y] = matrix[eHead[0] +
              y].replaceAt(eHead[1] + x, danger);
            }
    }
  };
  this.checkSymbols = function(x, y) {
    if (enemySymbols.indexOf(matrix[y][x]) + 1)
      return true;
    else
      return false;
  };

  this.findEnemy = function(point) {
    for (var y = -1; y <= 1; ++y)
      for (var x = -1; x <= 1; ++x)
        if (!(x == 0 && y == 0) && (x == 0 || y == 0))
          if (checkLimit(point[1] + x, point[0] + y)) {
            if (this.checkSymbols(point[1] + x, point[0] + y)) {
              if (allCoords.indexArrayInArray([point[0] + y, point[1] + x]) ==
                  -1) {
                allCoords[allCoords.length] = [point[0] + y, point[1] + x];
                coords[coords.length] = [point[0] + y, point[1] + x];
                this.findEnemy([point[0] + y, point[1] + x]);
              }
            }
          }
    return coords;
  };
}

function pointDistance(p1, p2) {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

function PathFinder() {
  var coords = [head[0], head[1]];
  var cost = step * 2;
  var maskCost = step * 2;
  var maskCoords = false;
  for (var ii = 0; ii < step; ii++) {
    wawes[ii] = [];
    for (var kk = 0; kk < step; kk++) {
      wawes[ii][kk] = step * 2;
    }
  }

  this.checkSafePoint = function(point, step) {
    var safe = 0;
    for (var y = -1; y <= 1; ++y)
      for (var x = -1; x <= 1; ++x)
        if (!(x == 0 && y == 0) && (x == 0 || y == 0))
        //проверка на выход за пределы поля
          if (checkLimit(point[1] + x, point[0] + y)) {
            if (this.checkPointObstacle(point[1] + x, point[0] + y))
              if (step < 2)
                safe++;
              else {
                if (this.checkSafePoint([point[1] + x, point[0] + y], step - 1))
                  safe++;
              }
          }
    if (safe >= 2)
      return true;
    else
      return false;
  };

  this.enemiesCheckPoint = function(point, dist) {
    var ret = true;
    enemies.forEach(function(enemy) {
      var dstn = pointDistance(point, enemy[0]);
      if (dstn < dist) {
        if (dstn < wawes[point[0]][point[1]] ||
            (dstn == wawes[point[0]][point[1]] &&
                ((length < enemy.length + 2 && wawes[point[0]][point[1]] !=
                    '♣' && status != 'fail') ||
                    (wawes[point[0]][point[1]] == '♣' && status != 'fail') ||
                    (length < enemy.length + 2 && wawes[point[0]][point[1]] ==
                        '♣' && status == 'fail')))) {
          ret = false;
          return false;
        }
      }
    });
    return ret;
  };

  this.checkEndPoint = function(x, y) {
    if (eatSymbols[status].indexOf(matrix[y][x]) + 1)
      return true;
    else
      return false;
  };

  this.checkPointObstacle = function(x, y) {
    if (symbols[status].indexOf(matrix[y][x]) + 1)
      return true;
    else
      return false;
  };
  this.getCoords = function() {
    if (maskTime > 0 && maskCoords)
      return maskCoords;
    else
      return coords;
  };
  this.getCell = function() {
    return this.returnToStart(coords);
  };
  this.returnToStart = function(point) {
    var mcrd = point;
    var minimal = wawes[point[0]][point[1]];
    for (var y = -1; y <= 1 && minimal != 1; ++y)
      for (var x = -1; x <= 1 && minimal != 1; ++x)
        if (!(x == 0 && y == 0) && (x == 0 || y == 0))
        //проверка на выход за пределы поля
          if (checkLimit(point[1] + x, point[0] + y)) {
            if (wawes[point[0] + y][point[1] + x] < minimal &&
                wawes[point[0] + y][point[1] + x] >= 1) {
              mcrd = [point[0] + y, point[1] + x];
              minimal = wawes[point[0] + y][point[1] + x];
            }
          }

    if (minimal < 2) {
      return mcrd;
    } else {
      if (mcrd)
        return this.returnToStart(mcrd);
      else {
        console.log('Error Find Path');
        return false;
      }
    }
  };

  this.checkPoints = function(p) {
    var count = p.length;
    var points = new Array();
    //если закончен расчёт, тикаем
    if (count == 0) return true;
    //обходим точки
    for (var i = 0; i < count; ++i) {
      //если достигли конца, то тикаем
      if (this.checkEndPoint(p[i][1], p[i][0])) {
        if (this.checkSafePoint(p[i], 2)) {
          if (this.enemiesCheckPoint(p[i], 5)) {
            var itscost = costs[matrix[p[i][0]][p[i][1]].charCodeAt(0)];
            if (cost > wawes[p[i][0]][p[i][1]] / itscost) {
              coords[0] = p[i][0];
              coords[1] = p[i][1];
              cost = wawes[p[i][0]][p[i][1]] / itscost;
              if (maskTime >= wawes[p[i][0]][p[i][1]]) {
                if (maskCost > cost) {
                  maskCost = cost;
                  maskCoords = coords;
                }
              }
            }
          }
        }
      }
      //проверяем окружные 4 клеток
      for (var y = -1; y <= 1; y++)
        for (var x = -1; x <= 1; x++) //++X БЫЛО
          if (!(x == 0 && y == 0) && (x == 0 || y == 0)) {
            //проверка на выход за пределы поля
            if (checkLimit(p[i][1] + x, p[i][0] + y)) {
              //проверка на препятствия
              if (this.checkPointObstacle(p[i][1] + x, p[i][0] + y) &&
                  this.checkSafePoint([p[i][0] + y, p[i][1] + x], 2)) {
                //проверка на краткость пути
                if (wawes[p[i][0] + y][p[i][1] + x] > wawes[p[i][0]][p[i][1]] +
                    1) {
                  wawes[p[i][0] + y][p[i][1] + x] = wawes[p[i][0]][p[i][1]] + 1;
                  points[points.length] = [p[i][0] + y, p[i][1] + x];
                }
              }
            }
          }
    }
    //повторяем для новых клеток
    this.checkPoints(points);
  };

}