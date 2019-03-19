class Leader {

    constructor(socketId) {
        this._socketId = socketId;
        this._canvas = {};
        this.room = '';

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
}

module.exports = Leader;