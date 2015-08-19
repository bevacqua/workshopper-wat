'use strict';

function isPortReady(port, ttl, next) {

  var net = require('net');
  var status = null;
  var timer;
  var timeout;

  function checkPort() {
    if (status === 'open') {
      if (timer) {
        clearInterval(timer);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
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

  timeout = setTimeout(next, ttl);
  timer = setInterval(checkPort, 500);
}

module.exports = isPortReady;
