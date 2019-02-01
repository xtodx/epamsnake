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
var okSymbols = [' ', '○', '$', '®', '©'];
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
    console.log("Head Find");
    head[0] = Math.floor(hd[0] / step);
    head[1] = hd[0] % step;
    headTo = hd[1];
    matrix = [];
    for (var i = 0, charsLength = data.length; i < charsLength; i += step) {
      matrix.push(data.substring(i, i + step));
    }
    var coord = findEat(data);
    console.log("Eay Find");
    var command = findPath(coord);
    console.log("Path Find");
    console.log(command);
    doSend(command);
  }
  printData();
}

function printData() {
  $('.board').html('');
  var br = '<br>';
  matrix.forEach(function(row) {
    $('.board').append(row + br);
  });
}

function findEat(data) {
  var regV = /○/gi;
  var result;
  var min = step * 2;
  var coords = [0, 0];
  while (result = regV.exec(data)) {
    var x = Math.floor(result.index / step);
    var y = result.index % step;
    var path = Math.abs(head[0] - y) + Math.abs(head[1] - x);
    if (min > path) {
      coords[0] = y;
      coords[1] = x;
      min = path;
    }
  }
  return coords;
}

function findPath(coords) {
  var STACK = [];
  if (coords[0] > head[0]) {
    STACK[STACK.length] = COMMANDS[2];
  } else {
    STACK[STACK.length] = COMMANDS[3];
  }

  if (coords[1] > head[1]) {
    STACK[STACK.length] = COMMANDS[1];
  } else {
    STACK[STACK.length] = COMMANDS[0];
  }

  return STACK[randomInteger(0, STACK.length - 1)];
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
