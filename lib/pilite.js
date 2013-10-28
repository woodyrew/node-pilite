/*
 * pilite
 * https://github.com/woodyrew/pilite
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

    /**
     * Initialisation function
     * 
     * @return {void}
     */
    init: function () {
        this.client = new SerialPort(this.device, {
            baudrate: this.baudrate
        }, false);
    },

    /**
     * Opens a connection and runs a callback.
     * 
     * @param  {Function} callback
     * 
     * @return {void}
     */
    connect: function (callback) {
        this.init();

        this.client.open(function() {
          console.log('Connected to Pi Lite');

          callback();
        });
    },

    /**
     * Writes commands to the serial to instruct the Pi Lite
     * 
     * @param  {string} data
     * 
     * @return {void}
     */
    write: function (data) {
        // console.log('Writing: '+ data);
        if (this.client !== null) {
            this.client.write(data, function(err, results) {
                if (err) {
                    console.log('Error', err);
                }

                // console.log('Result', results);
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

    /**
     * Set scrolling delay in ms 1 is scrolling very fast, 1000 is scrolling very slow. Default speed is 80.
     * 
     * @param {integer} value
     * @param {object} options      See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
    setSpeed: function(value, options) {
        return this._processCommand('SPEED', value, options);
    },
    /**
     * Sets a frame instantly in one go.
     * Using a 126 character string in ones and zeros to represent each LED state (on or off)
     * 
     * @param {string} value        126 char string
     * @param {object} options      See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
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
    /**
     * Sets a column to a percentage
     * 
     * @param {integer} column      1-14
     * @param {integer} value       percentage
     * @param {object} options      See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
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
    /**
     * Create graph from an array (max 14 columns)
     * 
     * @param {array} data          array of percentage values, array length should be 14 or less
     * @param {object} options      See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
    chart: function(data, options) {
        var that = this,
            command = '';

        data.forEach(function(graphValue, index) {
            command += that.barGraph(index + 1, graphValue, options);
        });
        return command;
    },
    /**
     * vuMeter - Horizontal bar graph
     * 
     * @param  {integer} row        1 or 2
     * @param  {integer} value      Percentage 0-100
     * @param  {object} options     See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
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

    /**
     * Set a pixel's state
     * 
     * @param  {integer} column     1 to 14
     * @param  {integer} row        1 to 9
     * @param  {string} action      ON, OFF or TOGGLE (Toggle will turn it off if it's on and visa versa)
     * @param  {object} options     See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
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
    
    /**
     * set all the pixels on or off
     * 
     * @param  {string} value       ON or OFF
     * @param  {object} options     See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
    all: function(value, options) {
        return this._processCommand('ALL', "," + value, options);
    },
    /**
     * Turns all pixels off - Alias to ALL,OFF
     * Doesn't have an options variable, if you want greater control use the all method above.
     * 
     * @return {string}
     */
    clear: function() {
        return this.all("OFF", options);
    },
    
    /**
     * Scroll value columns left (+) or right (-)
     * 
     * @param  {integer} value      -14 and 14 but not zero
     * @param  {object} options     See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
    scroll: function(value, options) {
        if (value < -14 || value > 14 || value == 0) {
            throw new Error('The value should be between -14 and 14 but not zero (inclusive)');
        }

        return this._processCommand('SCROLL', value, options);
    },

    /**
     * Display character at location x,y.
     * 
     * @param  {integer} column     1-14
     * @param  {integer} row        1-9
     * @param  {sting} character    ASCII
     * @param  {object} options     See {@link _processCommand} for options
     *
     * @return {string}             Command to perform required action
     */
    text: function(column, row, character, options) {
        this.write("$$$T"+ column +","+ row +","+ character +"\r");
        return this._processCommand('T', column + "," + row + "," + character, options);
    }
};

exports.PiLite = PiLite;