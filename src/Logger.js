export class Logger {

    static logLevelMap = {
        'info': 0,
        'debug': 1,
        'error': 2
    };

    static severityArray = ['info', 'debug', 'error'];

    static currentLogs = [];
    static EntryLimit = 5;
    static logLevel = 'info';

    static clearConsole() {
        if (typeof window !== 'undefined' && window.console) {
            console.clear();
        } else if (typeof global !== 'undefined' && global.console) {
            global.console.clear();
        }
    }

    static list(message, list, severity = Logger.logLevelMap.info) {
        Logger.log(message, severity);

        list.forEach(item => {
            Logger.log(item, severity);
        });
    }

    static log(message, severity = Logger.logLevelMap.info) {
        // check if severity is a number
        if (typeof severity === 'number') {
            if (severity < 0 || severity >= Logger.severityArray.length) {
                throw new Error(`Invalid severity level: ${severity}, should be between 0 and ${Logger.severityArray.length - 1}`);
            }
            severity = Logger.severityArray[severity];
        } else if (typeof severity === 'string') {
            // check if severity is a valid string
            if (Logger.logLevelMap[severity] === undefined) {
                throw new Error(`Invalid severity level: ${severity}, should be one of ${Object.keys(Logger.logLevelMap).join(', ')}`);
            }
        }

        if (Logger.currentLogs.length >= Logger.EntryLimit) {
            Logger.currentLogs.shift(); // Remove the oldest log entry
        }

        const timestamp = new Date().toISOString();

        Logger.currentLogs.push({ timestamp, message, severity });
        console.log(`[${severity.toUpperCase()}]: ${message}`);
    }


    static info(message) {
        this.log(message, 'info');
    }

    static warn(message) {
        this.log(message, 'warn');
    }

    static error(message) {
        this.log(message, 'error');
    }
}
