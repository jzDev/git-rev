var exec = require('child_process').exec;

/**
 * @param cmd {String}      Command to be executed
 * @param cb {Function}     Callback used after command execution
 * @param args {Array}      Extra command line arguments
 */
function _command (cmd, cb, args) {
  // TODO - allow ability to override existing arguments
  var hasArgs = Array.isArray(args) && args.length > 0;
  var fullCmd = cmd + (hasArgs ? (' ' + args.join(' ')) : '');

  exec(fullCmd, { cwd: __dirname }, function (err, stdout, stderr) {
    cb(stdout.split('\n').join(''))
  })
}

module.exports = {
    short : function (cb, args) {
      _command('git rev-parse --short HEAD', cb, args)
    }
  , long : function (cb, args) {
      _command('git rev-parse HEAD', cb, args)
    }
  , branch : function (cb, args) {
      _command('git rev-parse --abbrev-ref HEAD', cb, args)
    }
  , tag : function (cb, args) {
      _command('git describe --always --tag --abbrev=0', cb, args)
    }
  , log : function (cb, args) {
      _command('git log --no-color --pretty=format:\'[ "%H", "%s", "%cr", "%an" ],\' --abbrev-commit', function (str) {
        str = str.substr(0, str.length-1)
        cb(JSON.parse('[' + str + ']'))
      }, args)
    }
  , exactTag: function(cb, args){
    _command('git describe --exact-match --tags HEAD',function(str){
      if (str){
        cb(str)
      }else{
        cb(undefined)
      }

    }, args)
  }
}
