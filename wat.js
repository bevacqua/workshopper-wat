'use strict';

var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var path = require('path');
var contra = require('contra');
var assign = require('assignment');
var util = require('util');
var msee = require('msee');
var chalk = require('chalk');
var request = require('request');
var exercise = require('workshopper-exercise');
var filecheck = require('workshopper-exercise/filecheck');
var execute = require('workshopper-exercise/execute');
var randomPort = require('./randomPort');
var isPortReady = require('./isPortReady');
var t = require('./t');

function wat (options) {
  var context = exercise();
  filecheck(context);
  execute(context);
  context.addSetup(setup);
  context.addProcessor(processor);
  context.getSolutionFiles = renderSolution;
  return context;

  function setup (mode, done) {
    var port = context.port = randomPort();
    context.env = { // in a future version of workshopper this object wrapper will probably be gone
      env: assign(context.env, { PORT: port })
    };
    done();
  }

  function processor (mode, done) {
    if (options.piped === true) {
      context.submissionStdout.pipe(process.stdout);
    }
    (options.wait || wait)(verify);

    function wait (next) {
      isPortReady(context.port, (typeof options.waitTTL === 'number' ? options.waitTTL : 10000), next);
    }

    function verify () {
      var port = context.port;
      var href = util.format('http://localhost:%s%s', port, options.endpoint || '');

      if (options.request === false) {
        responded(null, null); return;
      }

      var requestOptions = assign({ url: href }, options.request);
      href = requestOptions.url; // update href in case it changed with `options.request`
      request(requestOptions, responded);

      function responded (err, res) {
        if (err) {
          error(context.__('fail.connection', { code: err.code, url: href })); return;
        }
        if (!options.verify) {
          error(context.__('fail.unverified')); return;
        }
        var req = {
          url: href,
          port: url.parse(href).port
        };
        options.verify(t(context, verified), req, res);
      }

      function verified (err, tests) {
        if (err) {
          error(err.stack || err); return;
        }
        tests.forEach(log);
        done(null, _.all(tests, 'pass'));
      }

      function log (test) {
        if (test.group) {
          if (test.tests.length) { // otherwise omit heading
            console.log('\n' + chalk.magenta(many('#', test) + ' ' + test.name));
            test.tests.forEach(log);
          }
        } else {
          context.emit(test.pass ? 'pass' : 'fail', test.message);
        }
      }

      function error (message) {
        context.emit('fail', message);
        done(null, false);
      }
    }
  }

  function lookupSolutionFile (done) {
    var uncheckedFiles = [
      'solution.' + context.lang + '.md',
      'solution.' + context.lang + '.txt',
      'solution.md',
      'solution.txt',
      'solution.' + context.defaultLang + '.md',
      'solution.' + context.defaultLang + '.txt'
    ];
    next();
    function next () {
      var filename = uncheckedFiles.shift();
      if (!filename) {
        done(null, ''); return;
      }
      var file = path.resolve(context.dir, filename);
      fs.exists(file, existed);
      function existed (exists) {
        if (!exists) {
          next(); return;
        }
        fs.stat(file, stated);
      }
      function stated (err, stat) {
        if (err) {
          done(err); return;
        }
        if (stat.isFile()) {
          done(null, file); return;
        }
        next();
      }
    }
  }

  function renderSolution (done) {
    contra.waterfall([contra.curry(lookupSolutionFile), read, log], done);
    function read (file, next) {
      fs.readFile(file, 'utf8', next);
    }
    function log (content, next) {
      console.log(msee.parse(content).replace(/\n+$/, '\n'));
      next(null, []);
    }
  }
}

function many (character, group) {
  var count = 1;
  while (group.parent) {
    group = group.parent;
    count++;
  }
  return Array(count + 1).join(character);
}

module.exports = wat;
