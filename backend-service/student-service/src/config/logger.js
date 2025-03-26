import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import chalk from "chalk"; // Corrected Chalk import

// Detect environment
const isDev = process.env.NODE_ENV === "development";

// Log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Chalk colors for different log levels
const logColors = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.green,
  http: chalk.cyan,
  verbose: chalk.magenta,
  debug: chalk.blue,
  silly: chalk.gray,
};

// Console format (prettified output with colors)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Capture stack traces
  winston.format.printf(({ level, message, timestamp,stack,  meta }) => {
    const colorFn = logColors[level] || chalk.white;
    const coloredLevel = colorFn(level.toUpperCase());
    const coloredTimestamp = chalk.gray(`[${timestamp}]`);
    const processInfo = chalk.yellow(`(PID: ${process.pid})`);
    const memoryUsage = chalk.cyan(`(Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB)`);
    const stackTrace = stack ? `\n${chalk.red(stack)}` : ""; // Show stack trace only in dev
    const formattedMeta =
      meta && Object.keys(meta).length
        ? `\n${chalk.cyan(JSON.stringify(meta, null, 2))}`
        : "";


    // Ensure log message is properly formatted
    if (message.includes("development") || message.includes("production")) {
      return `${coloredTimestamp} ${coloredLevel}: ${message} ${processInfo} ${memoryUsage}${stackTrace} `;
    } else {
      return `${coloredTimestamp} ${coloredLevel}: ${message}${stackTrace} ${formattedMeta}`;
    }
  })
);

// File format (clean, structured output)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return [
      `----------------------------------------`,
      `Timestamp:  ${timestamp}`,
      `Level:      ${level.toUpperCase()}`,
      `Message:    ${message}`,
      stack ? `Stack Trace:\n${stack}` : null,
      `----------------------------------------`,
    ]
      .filter(Boolean)
      .join("\n");
  })
);

// Winston Logger Configuration
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }) // Captures stack traces
  ),
  transports: [
    // Console Transport (for development)
    new winston.transports.Console({
      level: isDev ? "debug" : "info",
      format: consoleFormat,
    }),

    // General logs (rotating files)
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "info",
      format: fileFormat,
    }),

    // Error logs with stack traces
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      level: "error",
      format: fileFormat,
    }),
  ],
});

// Middleware for logging HTTP requests in Express
const httpLogger = (req, res, next) => {
  const start = process.hrtime(); // Start time for response duration
  res.on("finish", () => {
    const duration = process.hrtime(start);
    const responseTime = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(2); // Convert to ms
    const logMessage = `${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms) - ${req.ip}`;

    if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });

  next();
};

export { logger, httpLogger };
