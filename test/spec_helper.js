var http = require('http');
var child_process = require('child_process');

require('should');

module.exports.get = function (options, cb) {
  http.get(options, function(res) {
    eat_response(res, cb);
  }).on("error", function(e) {
    console.log("an error occured", e);
    cb(null, false, null);
  });
}

module.exports.eat_request = function(req, cb) {
  req.on("response", function(res) {
    eat_response(res, cb);
  });
}

module.exports.tail_log = function() {
  return child_process.spawn("tail", ['-n', '0', '-F', __dirname + "/../test_server/log/master.log"]);
}

module.exports.log_dir = function() {
  return __dirname + "/../test_server/log";
}

module.exports.spawn_cluster = function(options) {
  options = options || {workers : 1};
  return child_process.spawn("node", [__dirname + "/../test_server/app.js", JSON.stringify(options)]);
}

module.exports.after_connect = function (req, cb) {

  req.on("socket", function(sock) {
    sock.on("connect", function() {
     cb();
    });
  });
}

module.exports.eat_response = eat_response = function(res, cb) {
  var str = ""
  res.on('data', function(data) {
    str += data.toString();
  });
  
  res.on('end', function() {
    cb(null, true, str);
  });

  res.on("error", function(e) {
    console.log("an error occured", e);
    cb(null, false, null);
  });
}

module.exports.open_request = function (options, cb) {
  http.request(options, function(res) {
    cb(null, res);
  }).on('error', function(e) {
    cb(e);
  });
}

module.exports.wait_until_line = wait_until_line = function(log, line, cb) {
  var listener = function(data) {

    if (data.toString().indexOf(line) >= 0) {
      log.stdout.removeListener("data", listener);
      cb(null);
    }
  };

  log.stdout.on("data", listener);
}

module.exports.wait_until_initialized = function(log, cb) {
  wait_until_line(log, "Cluster initialized", cb);
}