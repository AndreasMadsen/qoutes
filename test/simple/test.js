
var quotes = require('../../lib/quotes.js');
var inspectpoint = require('inspectpoint');

var startDate = new Date('2013-01-03');

quotes('IBM', startDate, {
  timeout: 2000,
  interval: 5
})
  .pipe(inspectpoint({colors: true}))
  .pipe(process.stdout);
