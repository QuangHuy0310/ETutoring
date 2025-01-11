import { addColors, createLogger, format, transports } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

addColors(colors);

const formatLogger = format.combine(
  format.timestamp({ format: timezoned }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info['timestamp']} ${info.level}: \n ${info.message}`,
  ),
);

const Logger = createLogger({
  levels,
  format: formatLogger,
  transports: [new transports.Console()],
});

export default Logger;
