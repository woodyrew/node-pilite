# pilite

PiLite API module for programming in node.js.

The API mostly mirrors the functionality provided by the serial communications but with handy methods and value validations.  The source code isn't complicated and will help you better understand how it works.

## What's a piLite?
It's a credit card sized pcb that snugly fits on top of a [Raspberry Pi](http://www.raspberrypi.org/faqs).

[Ciseco piLite](http://shop.ciseco.co.uk/pi-lite-lots-of-leds-for-the-raspberry-pi-0805-red/)

See [Using the Pi-Lite pre-loaded software](http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/280#Using the Pi-Lite pre-loaded software) for the commands that are used with this module.

## Getting Started
First of all, run through the [piLite setup instructions](http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/283-setting-up-my-raspberry-pi) **before** plugging it in

Not got node installed on your Pi?  Check out the [install instructions for the Raspberry Pi](https://github.com/voodootikigod/node-serialport#raspberry-pi-linux) - you don't need to npm install serial as it's included in this module.

Install the module with: `npm install pilite`

```javascript
var pilite = require('pilite').PiLite;
pilite.connect(function() {
	// Run piLite commands
}
```

## Example
```javascript
var pilite = require('pilite').PiLite;

pilite.connect(function() {
	pilite.clear();
	
	// Toggles a random pixel twice a second.
    var timer = setInterval(function() {
        column = 1 + Math.floor(Math.random() * 14),
        row = 1 + Math.floor(Math.random() * 9);

        pilite.pixel(column, row, "TOGGLE");
    }, 500);
});
```

## API methods
Please read the source code to get a better understanding of each of these methods, what's expected in the parameters is documented there.  The unit tests are also useful to this end.

### `setSpeed(value, options)`
Set scrolling delay in ms 1 is scrolling very fast, 1000 is scrolling very slow. Default speed is 80.

### `frameBuffer(value, options)`
Sets a frame instantly in one go.  This is the most efficient method of updating the state of the PiLite if you want to do animations or multiple state changes at once without a bit of lag.

Using a 126 character string in ones and zeros to represent each LED state (on or off)

### `barGraph(column, value, options)`
Sets a column to a percentage

### `chart(data, options)`
Create graph from an array (max 14 columns)

### `vuMeter(row, value, options)`
vuMeter - Horizontal bar graph

### `pixel(column, row, action, options)`
Set a pixel's state

### `all(value, options)`
Set all the pixels on or off

### 'clear(options)'
Turns all pixels off - Alias to ALL,OFF
    
### 'scroll(value, options)'

Scroll value columns left (+) or right (-)

### `text(column, row, character, options)`
Display character at location x,y.

### `write(data)`
Writes commands to the serial to instruct the Pi Lite.  You can use this to pass text to scroll.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Credits
Fabrizio Codello's [Example Gist](https://gist.github.com/Fabryz/6189177) provided the basis for this module.

## Release History
- 0.1.1 - pilite-padawan
- 0.1.0 - First stable release

## License
Copyright (c) 2013 Woody Goodricke  
Licensed under the MIT license.
