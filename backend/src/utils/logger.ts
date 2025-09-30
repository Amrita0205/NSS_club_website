import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  DEBUG: 'debug';
}

class Logger {
  private logToFile(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(meta && { meta })
    };

    const logString = JSON.stringify(logEntry) + '\n';
    
    // Write to appropriate log file
    const logFile = path.join(logsDir, `${level}.log`);
    fs.appendFileSync(logFile, logString);
    
    // Also write to combined log
    const combinedLogFile = path.join(logsDir, 'combined.log');
    fs.appendFileSync(combinedLogFile, logString);
  }

  private logToConsole(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[35m',   // Magenta
      reset: '\x1b[0m'     // Reset
    };

    const color = colors[level as keyof typeof colors] || colors.reset;
    const resetColor = colors.reset;
    
    console.log(
      `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${resetColor}`,
      meta ? meta : ''
    );
  }

  info(message: string, meta?: any): void {
    this.logToConsole('info', message, meta);
    if (process.env.NODE_ENV !== 'test') {
      this.logToFile('info', message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    this.logToConsole('warn', message, meta);
    if (process.env.NODE_ENV !== 'test') {
      this.logToFile('warn', message, meta);
    }
  }

  error(message: string, meta?: any): void {
    this.logToConsole('error', message, meta);
    if (process.env.NODE_ENV !== 'test') {
      this.logToFile('error', message, meta);
    }
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole('debug', message, meta);
      this.logToFile('debug', message, meta);
    }
  }
}

export const logger = new Logger();