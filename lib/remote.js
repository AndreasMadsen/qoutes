
var util = require('util');
var stream = require('stream');

var newlinepoint = require('newlinepoint');
var reversepoint = require('reversepoint');
var slicepoint = require('slicepoint');
var request = require('request');
var csv = require('rfc-csv');

// Transform stream there converts row arrays intro object with correct type
function Remote(qoutes, begin, end) {
  if (!(this instanceof Remote)) return new Remote(qoutes, begin, end);

  stream.Transform.call(this, {
    objectMode: true
  });

  this.settings = qoutes._settings;
  this.qoutes = qoutes;
  this.begin = begin;

  // Create request url
  this.href = 'http://ichart.finance.yahoo.com/table.csv?g=d' +
    '&a=' + begin.getUTCMonth() +
    '&b=' + begin.getUTCDate() +
    '&c=' + begin.getUTCFullYear() +
    '&d=' + end.getUTCMonth() +
    '&e=' + end.getUTCDate() +
    '&f=' + end.getUTCFullYear() +
    '&s=' + this.settings.symbol;

  // If we aren't in live mode then start the request now
  if (this.qoutes._live === false) {
    this._pull();
    return this;
  }

  // Otherwice wait until the timeout has elapsed and then start pulling data
  setTimeout(this._pull.bind(this), this.settings.timeout);
}
module.exports = Remote;
util.inherits(Remote, stream.Transform);

Remote.prototype._pull = function () {
  console.log(this.href);
  
  // Create a long pipeline of transform streams all ending with this transform
  var res = request(this.href);
  res.pipe(process.stdout);
  res
      .pipe(slicepoint(0, -1)) // Remove trailing \n
      .pipe(newlinepoint('\r\n')) // Replace \n with \r\n
      .pipe(csv(true)) // Parse as CSV with header
      .pipe(reversepoint()) // Change from "end -> begin" to "begin -> end"
      .pipe(this); // Start pipeing data
};

// Takes a CSV row and convert the types
Remote.prototype._transform = function (row, encodeing, done) {
  var thisDate = new Date(row[0]);

  if (this.qoutes._first === false && thisDate.getTime() <= this.begin.getTime()) {
    return done(null);
  }

  this.push({
    date: thisDate,
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    adjClose: Number(row[6])
  });

  done(null);
};

Remote.prototype._flush = function (done) {
  done(null);
};
