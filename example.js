var Mouse = require('./');

var mouse = new Mouse(process);

mouse.on('click', function(e) {
	console.log('click at %d,%d with the %s mouse button', e.x, e.y, e.button);
});

mouse.on('down', function(e) {
	console.log('mousedown %d,%d with the %s mouse button', e.x, e.y, e.button);
});

mouse.on('up', function(e) {
	console.log('mouseup %d,%d with the %s mouse button', e.x, e.y, e.button);
});

mouse.on('scroll', function(e) {
	console.log('scroll %d,%d direction %s', e.x, e.y, e.button);
});

mouse.on('click', function(e) {
	if (e.x === 1 && e.y === 1) {
		process.exit(0);
	}
});

require('exit-hook')(mouse.stop.bind(mouse));

mouse.start();

console.log('Click on 1x1 to close');
