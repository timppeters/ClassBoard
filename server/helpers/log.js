class Log {

    static red(message) {
        let red = "\x1b[31m";
        let reset = "\x1b[0m";
        console.log(`${red}${message}${reset}`);
    }

    static green(message) {
        let green = "\x1b[32m";
        let reset = "\x1b[0m";
        console.log(`${green}${message}${reset}`);
    }

    static yellow(message) {
        let yellow = "\x1b[33m";
        let reset = "\x1b[0m";
        console.log(`${yellow}${message}${reset}`);
    }

    static blue(message) {
        let blue = "\x1b[34m";
        let reset = "\x1b[0m";
        console.log(`${blue}${message}${reset}`);
    }

    static magenta(message) {
        let magenta = "\x1b[35m";
        let reset = "\x1b[0m";
        console.log(`${magenta}${message}${reset}`);
    }

    static cyan(message) {
        let cyan = "\x1b[36m";
        let reset = "\x1b[0m";
        console.log(`${cyan}${message}${reset}`);
    }

    static white(message) {
        let white = "\x1b[37m";
        let reset = "\x1b[0m";
        console.log(`${white}${message}${reset}`);
    }


}

module.exports = Log;