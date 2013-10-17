/*
 * pilite
 * https://github.com/woody/pilite
 *
 * Copyright (c) 2013 Andrew Goodricke
 * Licensed under the MIT license.
 */

'use strict';

var SerialPort = require("serialport").SerialPort;

// http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/280#Using the Pi-Lite pre-loaded software
var PiLite = {
    device: "/dev/ttyAMA0",
    baudrate: 9600,
    client: null,
    init: function() {
        this.client = new SerialPort(this.device, {
            baudrate: this.baudrate
        }, false);
    },
    connect: function(callback) {
        this.init();

        this.client.open(function() {
          console.log('Connected to Pi Lite');

          callback();
        });
    },
    write: function(data) {
        // console.log('Writing: '+ data);
        if (this.client !== null) {
            this.client.write(data, function(err, results) {
                if (err) {
                    console.log('Error: '+ err);
                }

                // console.log('Result: '+ results);
            });
        }
    },
    // Set scrolling delay in ms 1 is scrolling very fast, 1000 is scrolling very slow. Default speed is 80.
    setSpeed: function(value) {
        var command = "$$$SPEED"+ value +"\r";
        this.write(command);
        return command;
    },
    // (value) is a 126 character string in one's and zeros to represent each LED state (on or off)
    frameBuffer: function(value) {
        var command;
        if (value.length !== 126) {
            throw new Error('String should be 126 characters long');
        }
        else if (/[^01]+/.test(value)) {
            throw new Error('String should only contain zeros and ones');
        }

        command = "$$$F"+ value +"\r";
        this.write(command);
        return command;

    },
    // Column X to Y%
    barGraph: function(column, value) {
        var command;
        if (column < 1 || column > 14) {
            throw new Error('The value of the column should be between 1-14 (inclusive)');
        }
        value = Math.round(value);
        if (value < 0 || value > 100) {
            throw new Error('The percentage should be between 0-100 (inclusive)');
        }

        command = "$$$B"+ column + "," + Math.round(value) + "\r";
        this.write(command);
        return command;
    },
    // Create graph from an array (max 14 columns)
    chart: function(data) {
        var that = this;
        data.forEach(function(graphValue, index) {
            that.barGraph(index + 1, graphValue);
        });
    },
    // Row X (1 | 2) to Y%
    vuMeter: function(row, value) {
        this.write("$$$V"+ row +","+ value +"\r");
    },
    // Pixel set a pixel state
    // column 1 to 14
    // row    1 to 9
    // action ON,OFF,TOGGLE
    pixel: function(column, row, action, returnOnly) {
        var pixelCommand = "$$$P"+ column +","+ row +","+ action +"\r";
        if (returnOnly) {
            return pixelCommand;
        }
        else {
            this.write(pixelCommand);
        }
    },
    // rowBuffer
    // Populates a line with the provided array
    rowBuffer: function (row, buffer) {
        var command = '';
        for (var i = 0; i < buffer.length; i++) {
            if (buffer[i] !== '-') {
                command += this.pixel(i + 1, row, (buffer[i] === '1' ? 'ON' : 'OFF'), true);
            }
        };
        this.write(command);
    },

    // colBuffer
    // Populates a line with the provided array
    colBuffer: function (col, buffer) {
        var command = '';
        for (var i = 0; i < buffer.length; i++) {
            if (buffer[i] !== '-') {
                command += this.pixel(col, i + 1, (buffer[i] === '1' ? 'ON' : 'OFF'), true);
            }
        };
        this.write(command);
    },
    
    // Text  display at location x,y a text character
    randomPixel: function(time) {
        var that = this;

        var timer = setInterval(function() {
            column = Math.floor(Math.random() * 15),
            row = Math.floor(Math.random() * 10);

            that.pixel(column, row, "TOGGLE");
        }, time);
    },
    // set all the pixels on or off
    all: function(value) {
        this.write("$$$ALL,"+ value +"\r");
    },
    // alias to ALL,OFF
    clear: function() {
        this.all("OFF");
    },
    // Scroll value columns left (+) or right (-)
    scroll: function(value) {
        this.write("$$$SCROLL"+ value +"\r");
    },
    // Text  display at location x,y a text character
    text: function(column, row, character) {
        this.write("$$$T"+ column +","+ row +","+ character +"\r");
    },
    // Display each character of the text after time ms, column and row are optional
    timed: function(text, time, column, row) {
        var that = this;

        column = column | 5,
        row = row | 2;

        var timer = setInterval(function() {
            character = text[0];
            text = text.substring(1);

            // Skip a turn on spaces
            if (character !== " ") {
                that.clear();
                that.text(column, row, character);
            }

            // TODO: Manually center short letters like I/J?
            //if (character == "I" || character == "I") {
            //    that.clear();
            //    that.text(column + 1, row, character);
            //}

            if (text.length <= 0) {
                // that.clear();
                clearInterval(timer);
            }
        }, time);
    }
};

exports.PiLite = PiLite;