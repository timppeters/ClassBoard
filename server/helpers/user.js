class User {

    constructor(socketId, nickname, room, undoStack) {
        this._socketId = socketId;
        this._canvas = '{"version":"2.7.0","objects":[]}';
        this._nickname = nickname;
        this._room = room;
        this._canvasHistory = undoStack;

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

    get canvasHistory() {
        return this._canvasHistory;
    }

    set canvasHistory(canvasHistory) {
        this._canvasHistory = canvasHistory;
    }
}

module.exports = User;