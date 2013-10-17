# pilite

PiLite API module for programming in node.js

## What's a piLite?
It's a credit card sized pcb that snugly fits on top of a [Raspberry Pi](http://www.raspberrypi.org/faqs).

[Ciseco piLite](http://shop.ciseco.co.uk/pi-lite-lots-of-leds-for-the-raspberry-pi-0805-red/)

See [Using the Pi-Lite pre-loaded software](http://openmicros.org/index.php/articles/94-ciseco-product-documentation/raspberry-pi/280#Using the Pi-Lite pre-loaded software) for the commands that are used with this module.

## Getting Started
Install the module with: `npm install pilite`

```javascript
var pilite = require('pilite');
pilite.connect(function() {
	// Run piLite commands
}
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Credits
Fabrizio Codello's [Example Gist](https://gist.github.com/Fabryz/6189177) provided the basis for this module.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Andrew Goodricke  
Licensed under the MIT license.
