class Leader {

    constructor(socketId) {
        this._socketId = socketId;
        this._canvas = {};
        this._room = '';
        this._screenDimensions = {};

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