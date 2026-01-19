/**
 * App build-time configuration derived from REACT_APP_* env vars.
 * This file intentionally contains no secrets and is safe for frontend use.
 */

const parseBooleanish = (value, defaultValue = false) => {
  if (typeof value !== "string") return defaultValue;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return defaultValue;
};

const safeParseJson = (value, fallback) => {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

// PUBLIC_INTERFACE
export function getAppConfig() {
  /** Read and normalize REACT_APP_* config with safe defaults. */
  const featureFlags = safeParseJson(process.env.REACT_APP_FEATURE_FLAGS, {});

  return {
    nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development",
    logLevel: (process.env.REACT_APP_LOG_LEVEL || "warn").toLowerCase(),
    experimentsEnabled: parseBooleanish(process.env.REACT_APP_EXPERIMENTS_ENABLED, false),
    featureFlags: typeof featureFlags === "object" && featureFlags ? featureFlags : {},
  };
}

// PUBLIC_INTERFACE
export function isFeatureEnabled(config, flagName) {
  /** Determine whether a feature flag is enabled. Defaults to false if missing. */
  if (!config || !config.featureFlags) return false;
  return Boolean(config.featureFlags[flagName]);
}
