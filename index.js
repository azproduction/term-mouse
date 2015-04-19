var events = require('events');
var util = require('util');

function Mouse(stdio) {
    if (!(this instanceof Mouse)) {
        return new Mouse(options);
    }

    stdio = stdio || {};
    this.stdin = stdio.stdin;
    this.stdout = stdio.stdout;

    this._onData = this._onData.bind(this);
    this._down = false;

    // Support easier events such as up, down and click.
    this.on('buttons', function (e) {
        if (e.button == 'none') {
            this.emit('up', e);

            if (this._down) {
                this.emit('click', this._down);
            }
            this._down = false;
        } else {
            this.emit('down', e);
            this._down = e;
        }
    });
}

util.inherits(Mouse, events.EventEmitter);

Mouse.prototype.start = function start() {
    this._bind();
    this._resume();
    this._rawMode();
    this._sendStart();

    return this;
};

Mouse.prototype._bind = function _bind() {
    this.stdin.on('data', this._onData);
};

Mouse.prototype._resume = function _resume() {
    this.stdin.resume();
};

Mouse.prototype._rawMode = function _rawMode() {
    this.stdin.setRawMode(true);
};

Mouse.prototype._sendStart = function _sendStart() {
    this.stdout.write('\x1b[?1005h');
    this.stdout.write('\x1b[?1003h');
};

Mouse.prototype._onData = function _onData(rawData) {
    this.emit('data', rawData);
    var s = rawData.toString('utf8');

    if (!/^\u001b\[M/.test(s)) {
        return;
    }

    // mouse event
    var modifier = s.charCodeAt(3);
    var event = {};
    event.shift = !!(modifier & 4);
    event.meta = !!(modifier & 8);
    event.ctrl = !!(modifier & 16);
    event.x = s.charCodeAt(4) - 32;
    event.y = s.charCodeAt(5) - 32;
    event.button = null;
    event.sequence = s;
    event.buf = Buffer(event.sequence);

    if ((modifier & 96) === 96) {
        event.name = 'scroll';
        event.button = modifier & 1 ? 'down' : 'up';
    } else {
        event.name = modifier & 64 ? 'move' : 'buttons';
        switch (modifier & 3) {
            case 0 :
                event.button = 'left';
                break;
            case 1 :
                event.button = 'middle';
                break;
            case 2 :
                event.button = 'right';
                break;
            case 3 :
                event.button = 'none';
                break;
            default :
                return;
        }
    }
    this.emit('event', event);
    this.emit(event.name, event);
};

Mouse.prototype.stop = function stop() {
    this._unbind();
    this._pause();
    this._sendStop();

    return this;
};

Mouse.prototype._unbind = function _unbind() {
    this.stdin.removeListener('data', this._onData);
};

Mouse.prototype._pause = function _pause() {
    this.stdin.pause();
};

Mouse.prototype._sendStop = function _sendStop() {
    this.stdout.write('\x1b[?1005l');
    this.stdout.write('\x1b[?1003l');
};

module.exports = Mouse;
