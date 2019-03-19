class Room {

    constructor(name, leader) {
        this._name = name;
        this._leader = leader;
        this._users = {};
        this._pin = '';
        this._started = false;

        this.generatePin();
    }

    set name(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get pin() {
        return this._pin;
    }

    set started(started) {
        this._started = started;
    }

    get started() {
        return this._started;
    }

    addUser(user) {
        if (this._users[user.socketId] == undefined) {
            this._users[user.socketId] = user;
            return true;
        }
        return false;
    }

    removeUser(socketId) {
        if (this._users[socketId] != undefined) {
            delete this._users[socketId];
            return true;
        }
        return false;
    }

    getUser(socketId) {
        return this._users[socketId];

    }

    generatePin() {
        let pinLength = 6;
        let pin = '';
        for (let i=0; i < pinLength; i++) {
            let num = Math.floor(Math.random() * 10);
            pin += toString(num);
        }
        this._pin = pin;
    }
    
}

module.exports = Room;