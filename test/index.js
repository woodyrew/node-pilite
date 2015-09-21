/*eslint-env node, mocha */

var expect = require('chai').expect;
var pilite = require('../lib');

describe('node-pilite basic functionality', function () {
    'use strict';

    var options = {'runCommand': false};

    it('should return string for setting pilite speed', function (done) {
        expect(pilite.setSpeed(50, options)).to.equal('$$$SPEED50\r');
        done();
    });

    it('accepts 126 character string in ones and zeros to represent each LED state (on or off)');
    it('accepts values for a bar graph');
    it('accepts values for a chart using barGraph');
    it('returns string for VU meter (horizontal)');
    it("returns string for setting pixel's state");
    it('returns a string to put all pixels in the same state');
    it('returns string for scrolling the pixels across the display');
    it('returns string for a single character to be displayed');

});
