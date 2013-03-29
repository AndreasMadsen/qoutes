
var util = require("util");
var stream = require('stream');

function Test() {
  if (!(this instanceof Test)) return new Test();
  
  var self = this, i = 0;
  
  stream.Readable.call(this, {
    objectMode: true
  });
  
  this._fakeData = [i];
  
  setInterval(function () {
    self._fakeData.push(++i);
    
    // Start the read flow again
    // ISSUE: this won't work because the pipe mashine thinks that there is
    // still something to read.
    self.read(0);
  }, 400);
}
util.inherits(Test, stream.Readable);
module.exports = Test;

Test.prototype._read = function (n, event) {
  if (this._fakeData.length) {
    return this.push(this._fakeData.pop().toString() + ' ');
  }
  
  // There is nothing to read
  // ISSUE: Call something, there sets state.reading = false, in a buffer stream
  // that would be this.push(''), but in objectMode this will result in an empty
  // string beging pushed to the internal buffer queue.
  this._readableState.reading = false;
};

Test().pipe(process.stdout);
