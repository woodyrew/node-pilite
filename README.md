# pilite

PiLite API module for programming in node.js

## What's a piLite?
It's a credit card sized pcb that snugly fits on top of a [Raspberry Pi](http://www.raspberrypi.org/faqs).

[Ciseco piLite](http://shop.ciseco.co.uk/pi-lite-lots-of-leds-for-the-raspberry-pi-0805-red/)

See [Using the Pi-Lite pre-loaded software](http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/280#Using the Pi-Lite pre-loaded software) for the commands that are used with this module.

## Getting Started
Not got node installed on your Pi?  Check out the [install instructions for the Raspberry Pi](https://github.com/voodootikigod/node-serialport#raspberry-pi-linux) - you don't need to npm install serial as it's included in this module.

Install the module with: `npm install pilite`

```javascript
var pilite = require('pilite').PiLite;
pilite.connect(function() {
	// Run piLite commands
}
```

## Examples
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
