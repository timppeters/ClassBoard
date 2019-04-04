class Leader {

    constructor(socketId) {
        this._socketId = socketId;
        this._canvas = '{"version":"2.7.0","objects":[]}';
        this._room = '';
        this._canvasHistory = [];
        this._editingUserBoard = '';

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

    set editingUserBoard(nickname) {
        this._editingUserBoard = nickname;
    }

    get editingUserBoard() {
        return this._editingUserBoard;
    }

    get canvasHistory() {
        return this._canvasHistory;
    }

    set canvasHistory(canvasHistory) {
        this._canvasHistory = canvasHistory;
    }
}

module.exports = Leader;