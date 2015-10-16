'use strict';

var net = require('net');
var once = require('contra/once');

function isPortReady (port, ttl, done) {
  var next = once(done);
  var timeout = setTimeout(next, ttl);
  var timer = setInterval(checkPort, 500);
  var status;

  function checkPort () {
    if (status === 'open') {
      clearTimeout(timeout);
      clearInterval(timer);
      next(); return;
    }
    var socket = new net.Socket();
    socket.on('connect', function connect() {
      status = 'open';
      socket.destroy();
    });
    socket.setTimeout(ttl);
    socket.on('timeout', function timeout() {
      status = 'closed';
      socket.destroy();
    });
    socket.on('error', function error() {
      status = 'closed';
      socket.destroy();
    });
    socket.connect(port);
  }
}

module.exports = isPortReady;
