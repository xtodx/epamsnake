$(document).ready(function() {
  snakeWebSocket();
});

function reloadPage() {
  location.reload();
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

var socket;
var URL = 'https://game2.epam-bot-challenge.com.ua/codenjoy-contest/board/player/tonylovepony@gmail.com?code=528051571629643063';
var COMMANDS = ['LEFT', 'RIGHT', 'DOWN', 'UP', 'ACT'];
var matrix = [];
var wawes = [];
var length = 0;
var head = [0, 0]; // y, x
var step;

var headSymbols = ['◄', '►', '▲', '▼', '♥', '♠'];
var fly = '♠';
var fury = '♥';
var status = 'ok';
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
  'flybig': [
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
  'ok': ['○', '$', '®', '©'],
  'fly': ['○', '$', '®', '©'],
  'flybig': ['○', '●', '$', '®', '©'],
  'big': ['○', '●', '$', '®', '©'],
  'fury': [
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
var prevObj = '○';
var bigLength = 5;
var snakeSymbols = ['╙', '╘', '╓', '╕', '═', '║', '╗', '╝', '╔', '╚'];

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
    reloadPage();
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
  matrix = [];
  for (var i = 0, charsLength = data.length; i < charsLength; i += step) {
    matrix.push(data.substring(i, i + step));
  }
  var hd = data.indexOfArray(headSymbols);
  length = findLength(data);
  console.log('LENGTH = ' + length);
  setStatus(data);
  if (hd) {
    head[0] = Math.floor(hd[0] / step);
    head[1] = hd[0] % step;
    var lee = new Lee();
    console.log('Finding...');
    wawes[head[0]][head[1]] = 0;
    lee.checkPoints([[head[0], head[1]]]);
    console.log('EAT ON ' + lee.getCoords());
    var cell = lee.getCell();
    console.log('Sending...');
    if (cell) {
      console.log('Command :)');
      doSend(getCommand(cell));
    } else {
      console.log('NO COMMAND :(');
      doSend('NONE');
    }
  } else {
    doSend('NONE');
  }
  printData();
}

function findLength(data) {
  var lngth = 1;
  snakeSymbols.forEach(function(sym) {
    if (data.indexOf(data) + 1)
      lngth += (data.split(sym).length - 1);
  });

  return lngth;

}

function setStatus(data) {
  var minLength = bigLength;
  if (prevObj == stone)
    minLength += bigLength;
  if (data.indexOf(fury) + 1) {
    status = 'fury';
  } else if (data.indexOf(fly) + 1) {
    if (length >= minLength)
      status = 'flybig';
    else
      status = 'fly';
  } else if (length >= minLength) {
    status = 'big';
  } else {
    status = 'ok';
  }
}

function getCommand(cell) {
  console.log('Next Cell');
  console.log(cell);
  console.log('Head Cell');
  console.log(head);
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
  if (status == 'big' || status == 'fury')
    com += ',' + COMMANDS[4];
  return com;
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

function Lee() {
  var bEnd = false;
  var coords = [head[0], head[1]];
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

  this.checkSafePoint = function(point, step) {
    var safe = 0;
    for (var y = -1; y <= 1; ++y)
      for (var x = -1; x <= 1; ++x)
        if (!(x == 0 && y == 0) && (x == 0 | y == 0))
        //проверка на выход за пределы поля
          if (this.checkLimit(point[1] + x, point[0] + y)) {
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
        if (!(x == 0 && y == 0) && (x == 0 | y == 0))
        //проверка на выход за пределы поля
          if (this.checkLimit(point[1] + x, point[0] + y))
            if (wawes[point[0] + y][point[1] + x] < minimal &&
                wawes[point[0] + y][point[1] + x] >= 1) {
              mcrd = [point[0] + y, point[1] + x];
              minimal = wawes[point[0] + y][point[1] + x];
            }

    if (minimal == 1) {
      console.log(mcrd);
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
    if (count == 0 || bEnd) return true;
    //обходим точки
    for (var i = 0; i < count; ++i) {
      //если достигли конца, то тикаем
      if (this.checkEndPoint(p[i][1], p[i][0])) {
        if (this.checkSafePoint(p[i], 2)) {
          bEnd = true;
          coords[0] = p[i][0];
          coords[1] = p[i][1];
          console.log('I WANT EAT - ' + matrix[p[i][0]][p[i][1]]);
          console.log(wawes);
          return true;
        }
      }
      //проверяем окружные 4 клеток
      for (var y = -1; y <= 1; y++)
        for (var x = -1; x <= 1; x++) //++X БЫЛО
          if (!(x == 0 && y == 0) && (x == 0 || y == 0)) {
            //проверка на выход за пределы поля
            if (this.checkLimit(p[i][1] + x, p[i][0] + y)) {
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
          }
    }
    //повторяем для новых клеток
    this.checkPoints(points);
  };

}