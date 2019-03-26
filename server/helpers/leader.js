class Leader {

    constructor(socketId) {
        this._socketId = socketId;
        this._canvas = '{"version":"2.7.0","objects":[]}';
        this._room = '';
        this._screenDimensions = {};
        this._canvasHistory = [];

    }

    set canvas(canvas) {
        this._canvas = canvas;
    }

    get canvas() {
        return this._canvas;
    }

    set room(room) {
        this._room = room;
    }

    get room() {
        return this._room;
    }

    get socketId() {
        return this._socketId;
    }

    set screenDimensions(dimensions) {
        this._screenDimensions = dimensions;
    }

    get screenDimensions() {
        return this._screenDimensions;
    }
}

module.exports = Leader;