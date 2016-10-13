var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

/**
 * Map for method name to the command line call with default set params
 */
var DEFAULT_COMMAND_MAP = {
  short: 'git rev-parse --short HEAD',
  long: 'git rev-parse HEAD',
  branch: 'git rev-parse --abbrev-ref HEAD',
  tag: 'git describe --always --tag --abbrev=0',
  log: 'git log --no-color --pretty=format:\'[ "%H", "%s", "%cr", "%an" ],\' --abbrev-commit',
  exactTag: 'git describe --exact-match --tags HEAD'
};

/**
 * @param cmd {String}      Command to be executed
 * @param cb {Function}     Callback used after command execution
 * @param args {Array}      Extra command line arguments
 */
function _command(cmd, cb, args, ops) {
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

function generateCommand(methodName, parser) {
  var commandStr = DEFAULT_COMMAND_MAP[methodName];

  return function(_cb, _args, _options) {
    var hasCallback = typeof _cb === 'function'; // Callback is optional for a synchronous cmd execution

    var cb = hasCallback ? _cb : function() {};
    var cmdArgs = hasCallback ? _args : _cb;
    var cmdOptions = (hasCallback ? _options : _args) || {};

    if (cmdOptions.sync !== true && !hasCallback) {
      throw new Error('Missing callback for the asynchronous git-rev ' + method + '.');
    }

    // Parser specified on the response
    if (typeof parser === 'function') {
      var originalCb = cb;
      var updatedResponse = null;

      // Wrap the callback to call the parser on the response before calling the callback
      cb = function(response) {
        updatedResponse = parser(response);
        originalCb(updatedResponse);
      };

       _command(commandStr, cb, cmdArgs, cmdOptions);

      return updatedResponse;
    }

    return _command(commandStr, cb, cmdArgs, cmdOptions);
  };
}

module.exports = {
    short : generateCommand('short')
  , long : generateCommand('long')
  , branch : generateCommand('branch')
  , tag : generateCommand('tag')
  , log : generateCommand('log', function(str) {
    str = str.substr(0, str.length-1)
    return JSON.parse('[' + str + ']');
  })
  , exactTag: generateCommand('exactTag', function(str) {
    str = str ? str : undefined;
    return str;
  })
}
