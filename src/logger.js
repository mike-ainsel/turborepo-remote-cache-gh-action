import { debug, error, info, warning } from '@actions/core';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  _log(level, message, data = {}) {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
        message,
        ...data,
      };

      const logMessage = JSON.stringify(logEntry);

      switch (level) {
      case LOG_LEVELS.DEBUG:
        debug(logMessage);
        break;
      case LOG_LEVELS.INFO:
        info(logMessage);
        break;
      case LOG_LEVELS.WARN:
        warning(logMessage);
        break;
      case LOG_LEVELS.ERROR:
        error(logMessage);
        break;
      }
    }
  }

  debug(message, data = {}) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = {}) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = {}) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data = {}) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }
}

export const logger = new Logger(process.env.LOG_LEVEL); 