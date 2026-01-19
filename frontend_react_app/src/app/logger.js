const LEVELS = ["error", "warn", "info", "debug"];

const levelToNumber = (level) => {
  const idx = LEVELS.indexOf(String(level || "").toLowerCase());
  return idx === -1 ? LEVELS.indexOf("warn") : idx;
};

// PUBLIC_INTERFACE
export function createLogger(logLevel) {
  /** Create a console logger filtered by configured log level. */
  const threshold = levelToNumber(logLevel);

  const shouldLog = (level) => levelToNumber(level) <= threshold;

  return {
    error: (...args) => shouldLog("error") && console.error(...args),
    warn: (...args) => shouldLog("warn") && console.warn(...args),
    info: (...args) => shouldLog("info") && console.info(...args),
    debug: (...args) => shouldLog("debug") && console.debug(...args),
  };
}
