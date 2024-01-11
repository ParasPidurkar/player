const LogLevel = Object.freeze({
    Verbose: Symbol("0"),
    Debug: Symbol("1"),
    Info: Symbol("2"),
    Warning: Symbol("3"),
    Error: Symbol("4"),
    Fatal: Symbol("5"),
    Silent: Symbol("6")
})

class Log {
    static logLevel = LogLevel.Verbose;

    static setLogLevel(value) {
        if (Object.values(LogLevel).includes(value)) {
            this.logLevel = value;
        }
    }

    static verbose(message) {
        if (this.logLevel.description <= LogLevel.Verbose.description) {
            console.log(message);
            //console.trace(message);
        }

    }

    static debug(message) {
        if (this.logLevel.description <= LogLevel.Debug.description) {
            console.log(message);
            //console.trace(message);
        }

    }

    static info(message) {
        if (this.logLevel.description <= LogLevel.Info.description) {
            console.log(message);
        }

    }

    static warning(message) {
        if (this.logLevel.description <= LogLevel.Warning.description) {
            console.warn(message);
        }
    }

    static error(message) {
        if (this.logLevel.description <= LogLevel.Error.description) {
            console.error(message);
        }
    }

    static fatal(message) {
        if (this.logLevel.description <= LogLevel.Fatal.description) {
            console.error(message);
        }
    }
}

export { LogLevel, Log };