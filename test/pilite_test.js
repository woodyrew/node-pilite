'use strict';

var pilite = require('../lib/pilite.js').PiLite;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['test'] = {
  // setUp: function(done) {
  //   // setup here
  //   pilite.connect();
  //   done();   
  // },
  'correctly returns string for setting pilite speed': function(test) {
    test.expect(1);
    test.equal(pilite.setSpeed(50), "$$$SPEED50\r", 'should be $$$SPEED50.');
    test.done();
  },
  'correctly accepts 126 character string in ones and zeros to represent each LED state (on or off)': function(test) {
    var correctCommand = '000000000000000000000111000011111110011111110111111111111101111111101111011000110011000110000000000000000000000000000000000000',
      expected = "$$$F" + correctCommand + "\r"
    test.expect(4);
    test.throws(function() {pilite.frameBuffer('1')}, Error, 'Should only allow a string of exactly 126 characters');
    test.throws(function() {pilite.frameBuffer(correctCommand + '1')}, Error, 'Should only allow a string of exactly 126 characters');
    test.throws(function() {pilite.frameBuffer(correctCommand.pop().push('a'))}, Error, 'Should only allow zeros and ones');
    test.equal(pilite.frameBuffer(correctCommand), expected, 'should be ' + expected + '.');
    test.done();
  },
  'correctly accepts values for a bar graph': function(test) {
    var oneForteenth = 100 / 14,
      percent, expected;
    test.expect(18);
    for (var i = 1; i <= 14; i++) {
      percent = (100 - (oneForteenth * i));
      expected = '$$$B' + i + ',' + Math.round(percent);
      test.equal(pilite.barGraph(i, percent), expected + "\r", 'should be ' + expected + '.');
    };
    test.throws(function() {pilite.barGraph(0, 50)}, Error, 'Should only allow columns 1-14');
    test.throws(function() {pilite.barGraph(15, 50)}, Error, 'Should only allow columns 1-14');
    test.throws(function() {pilite.barGraph(1, -1)}, Error, 'Should only allow percentages 0-100');
    test.throws(function() {pilite.barGraph(1, 101)}, Error, 'Should only allow percentages 0-100');
    test.done();
  },
  'correctly accepts values for a horizontal chart': function(test) {
    var oneForteenth = 100 / 14,
      correctInput = [];

    for (var i = 1; i <= 14; i++) {
      correctInput.push(Math.round(100 - (oneForteenth * i)));
    };

    test.expect(3);
    test.doesNotThrow(function() {pilite.chart(correctInput)});
    test.throws(function() {pilite.chart(50)}, Error, 'Array should be provided');
    test.throws(function() {pilite.chart(correctInput.push(0))}, Error, 'Array of too many elements provided');
    // Maybe ensure the function returns the commands? (Enhancement)
    test.done();
  }/*,
  'correctly returns string for setting pilite speed': function(test) {
    test.expect(1);
    test.equal(pilite.vuMeter(50), "$$$SPEED50\r", 'should be $$$SPEED50.');
    test.done();
  },
  'correctly returns string for setting pilite speed': function(test) {
    test.expect(1);
    test.equal(pilite.pixel(50), "$$$SPEED50\r", 'should be $$$SPEED50.');
    test.done();
  },
  'correctly returns string for setting pilite speed': function(test) {
    test.expect(1);
    test.equal(pilite.colBuffer(50), "$$$SPEED50\r", 'should be $$$SPEED50.');
    test.done();
  },
  'correctly returns string for setting pilite speed': function(test) {
    test.expect(1);
    test.equal(pilite.randomPixel(50), "$$$SPEED50\r", 'should be $$$SPEED50.');
    test.done();
  }*/

};
