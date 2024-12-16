import loglevel, { LogLevelNames, Logger } from 'loglevel';

const DEFAULT_LOG = 'info:';

// NEXT_PUBLIC_LOG_LEVEL variable format is as follows.
// NEXT_PUBLIC_LOG_LEVEL="<defaultLevel>[:<module1>;level,<module2>;level...]"
const logLevelConfig = process.env.NEXT_PUBLIC_LOG_LEVEL || DEFAULT_LOG;
const [defaultLevel, moduleList] = logLevelConfig.split(':');

type RegexLevel = { regex: RegExp, level: LogLevelNames };

const modules: Record<string, LogLevelNames> = {};
const regexes: RegexLevel[] = [];
if (moduleList) {
    moduleList.split(',')
        .forEach((modAndLevel: string) => {
            const [name, level] = modAndLevel.split(';');
            if (name.includes('*') || name.includes('.')) {
                regexes.push({ regex: new RegExp(`^${name.replace(/\*/g, '.*')}$`), level: level as LogLevelNames });
            } else {
                modules[name] = level as LogLevelNames;
            }
        });
}
loglevel.setLevel(defaultLevel as LogLevelNames);

const originalFactory = loglevel.methodFactory;
loglevel.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (...args) {
        const messages = [];
        for (let i = 0; i < args.length; i++) {
            if (i === 0) {
                messages.push(`${new Date().toISOString()} ${methodName.toUpperCase()}: ${args[i]}`);
            } else {
                messages.push(args[i]);
            }
        }
        rawMethod(...messages);
    };
};
loglevel.rebuild();

const appLog = {
    getLogger: (name: string): Logger => {
        const log = loglevel.getLogger(name);
        if (modules[name]) {
            loglevel.info('Setting log level for', name, 'to', modules[name]);
            log.setLevel(modules[name]);
        } else if (regexes.length > 0) {
            const regexMatch = regexes.find((r) => r.regex.test(name));
            if (regexMatch) {
                loglevel.info('Setting log level for', name, 'to', regexMatch.level);
                log.setLevel(regexMatch.level);
            } else {
                log.setLevel(defaultLevel as LogLevelNames);
            }
        } else {
            log.setLevel(defaultLevel as LogLevelNames);
        }
        return log;
    }
};

export default appLog;
