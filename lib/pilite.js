/*
 * pilite
 * https://github.com/woody/pilite
 *
 * Copyright (c) 2013 Andrew Goodricke
 * Licensed under the MIT license.
 */

'use strict';

var SerialPort = require("serialport").SerialPort;

var PiLite = {
    device: "/dev/ttyAMA0",
    baudrate: 9600,
    client: null,

    init: function () {
        this.client = new SerialPort(this.device, {
            baudrate: this.baudrate
        }, false);
    },
    connect: function (callback) {
        this.init();

        this.client.open(function() {
          console.log('Connected to Pi Lite');

          callback();
        });
    },
    write: function (data) {
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
    /**
     * returns a command string
     * @param  {string} code        PiLite Command Code
     * @param  {mixed} value        Command Value
     * @param  {boolean} newLine    Whether to return a new line at the end
     * 
     * @return {string}
     */
    _getCommand: function (commandCode, value, newLine) {
        newLine = (typeof newLine !== 'undefined') ? newLine : true;
        return '$$$' + commandCode + value + (newLine ? "\r" : '');
    },
    /**
     * Gets an item's value from an object and defaults to a passed value if not present.
     * 
     * @param  {object} obj             Object to search
     * @param  {mixed} item             Item to find within object
     * @param  {mixed} myDefault        Default value to provide if item's not found
     * 
     * @return {mixed}
     */
    _getItemValue: function (obj, item, myDefault) {
        return (obj && typeof obj[item] !== 'undefined') ? obj[item] : myDefault;
    },
    /**
     * Generally the process that needs to occur
     * @see The <a href="http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/280#Using the Pi-Lite pre-loaded software">Pi-Lite pre-loaded software commands</a>.
     * 
     * @param  {string} commandCode     Code for the Pi Lite to process see url
     * @param  {mixed} value            Value to apply to the command
     * @param  {object} options         Options that might be required
     * 
     * @return {string}
     */
    _processCommand: function (commandCode, value, options) {
        var runCommand = this._getItemValue(options, 'runCommand', true),
            newLine = this._getItemValue(options, 'newLine', true),
            command = this._getCommand(commandCode, value, newLine);
        
        if (runCommand) {
            this.write(command);
        }
        return command;
    },
    // Set scrolling delay in ms 1 is scrolling very fast, 1000 is scrolling very slow. Default speed is 80.
    setSpeed: function(value, options) {
        return this._processCommand('SPEED', value, options);
    },
    // (value) is a 126 character string in one's and zeros to represent each LED state (on or off)
    frameBuffer: function(value, options) {
        var command;
        if (value.length !== 126) {
            throw new Error('String should be 126 characters long');
        }
        else if (/[^01]+/.test(value)) {
            throw new Error('String should only contain zeros and ones');
        }

        return this._processCommand('F', value, options);
    },
    // Column X to Y%
    barGraph: function(column, value, options) {
        if (column < 1 || column > 14) {
            throw new Error('The value of the column should be between 1-14 (inclusive)');
        }
        value = Math.round(value);
        if (value < 0 || value > 100) {
            throw new Error('The percentage should be between 0-100 (inclusive)');
        }

        return this._processCommand('B', column + "," + value, options);
    },
    // Create graph from an array (max 14 columns)
    chart: function(data, options) {
        var that = this,
            command = '';

        data.forEach(function(graphValue, index) {
            command += that.barGraph(index + 1, graphValue, options);
        });
        return command;
    },
    // Row X (1 | 2) to Y%
    vuMeter: function(row, value, options) {
        if (row < 1 || row > 2) {
            throw new Error('The value of the row should be between 1-2 (inclusive)');
        }
        value = Math.round(value);
        if (value < 0 || value > 100) {
            throw new Error('The percentage should be between 0-100 (inclusive)');
        }

        return this._processCommand('V', row + "," + value, options);
    },
    // Pixel set a pixel state
    // column 1 to 14
    // row    1 to 9
    // action ON,OFF,TOGGLE
    pixel: function(column, row, action, options) {
        if (column < 1 || column > 14) {
            throw new Error('The value of the column should be between 1-14 (inclusive)');
        }
        if (row < 1 || row > 9) {
            throw new Error('The value of the row should be between 1-9 (inclusive)');
        }
        if (action !== 'ON' && action !== 'OFF' && action !== 'TOGGLE') {
            throw new Error("The value of the action should be ON, OFF or TOGGLE");
        }

        return this._processCommand('P', column + "," + row + "," + action, options);
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
    // take this out of the library?
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