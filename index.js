var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

/**
 * @param cmd {String}      Command to be executed
 * @param cb {Function}     Callback used after command execution
 * @param args {Array}      Extra command line arguments
 */
function _command (cmd, cb, args, ops) {
  var options = ops || {};
  // TODO - allow ability to override existing arguments
  var hasArgs = Array.isArray(args) && args.length > 0;
  var fullCmd = cmd + (hasArgs ? (' ' + args.join(' ')) : '');

  if (options.sync === true) {
    var stdout = execSync(fullCmd, { cwd: __dirname, encoding: 'utf8' });
    return cb(stdout.split('\n').join(''));
  } else {
    exec(fullCmd, { cwd: __dirname }, function (err, stdout, stderr) {
      cb(stdout.split('\n').join(''))
    });
  }
}

// TODO - remove duplicate code
module.exports = {
    short : function (cb, args, options) {
      _command('git rev-parse --short HEAD', cb, args, options)
    }
  , long : function (cb, args, options) {
      _command('git rev-parse HEAD', cb, args, options)
    }
  , branch : function (cb, args, options) {
      _command('git rev-parse --abbrev-ref HEAD', cb, args, options)
    }
  , tag : function (cb, args, options) {
      _command('git describe --always --tag --abbrev=0', cb, args, options)
    }
  , log : function (cb, args, options) {
      _command('git log --no-color --pretty=format:\'[ "%H", "%s", "%cr", "%an" ],\' --abbrev-commit', function (str) {
        str = str.substr(0, str.length-1)
        cb(JSON.parse('[' + str + ']'))
      }, args, options)
    }
  , exactTag: function(cb, args, options){
    _command('git describe --exact-match --tags HEAD',function(str){
      if (str){
        cb(str)
      }else{
        cb(undefined)
      }

    }, args, options)
  }
}
