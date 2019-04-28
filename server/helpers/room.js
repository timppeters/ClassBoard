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

    get users() {
        return this._users;
    }

    get usersNicknames() {
        return Object.keys(this._users);
    }

    set started(started) {
        this._started = started;
    }

    get started() {
        return this._started;
    }

    get leader() {
        return this._leader;
    }

    nicknameTaken(nickname) {
        if (this._users[nickname] != undefined) {
            return true;
        }
        return false;
    }

    addUser(user) {
        if (this._users[user.nickname] == undefined) {
            this._users[user.nickname] = user;
            return true;
        }
        return false;
    }

    removeUserBySocketId(socketId) {
        Object.keys(this._users).forEach( nickname => {
            if (this._users[nickname].socketId == socketId) {
                delete this._users[nickname];
                return true;
            }
        });
        return false;
    }

    removeUserByNickname(nickname) {
        if (this._users[nickname] != undefined) {
            delete this._users[nickname];
            return true;
        }
        return false;
    }

    getUserNickname(socketId) {
        Object.keys(this._users).forEach( nickname => {
            if (this._users[nickname].socketId == socketId) {
                return nickname;
            }
        });

    }

    getSocketIds() {
        let _sockets = [];
        Object.keys(this._users).forEach( nickname => {
            _sockets.push(this._users[nickname].socketId);
        });
        return _sockets;
    }

    generatePin() {
        let pinLength = 6;
        let pin = '';
        for (let i=0; i < pinLength; i++) {
            let num = Math.floor(Math.random() * 10);
            pin += num.toString();
        }
        this._pin = pin;
    }
    
}

module.exports = Room;