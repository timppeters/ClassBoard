class User {

    constructor(socketId, nickname, room) {
        this._socketId = socketId;
        this._canvas = {};
        this._nickname = nickname;
        this._room = room;
        this._screenDimensions = {};

    }

    set nickname(nickname) {
        this._nickname = nickname;
    }

    get nickname() {
        return this._nickname;
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

module.exports = User;