"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createConfig: () => createConfig,
  createFeatureFlags: () => createFeatureFlags,
  createPriceConfig: () => createPriceConfig,
  createRouteMapping: () => createRouteMapping,
  createServiceInfo: () => createServiceInfo,
  getEnv: () => getEnv,
  getEnvBoolean: () => getEnvBoolean,
  getEnvJson: () => getEnvJson,
  getEnvNumber: () => getEnvNumber,
  getRequiredEnv: () => getRequiredEnv,
  getRoutePrice: () => getRoutePrice,
  isFeatureEnabled: () => isFeatureEnabled,
  parsePrice: () => parsePrice,
  validateConfig: () => validateConfig
});
module.exports = __toCommonJS(index_exports);
function getEnv(key, defaultValue) {
  return process.env[key] ?? defaultValue;
}
function getRequiredEnv(key) {
  const value = process.env[key];
  if (value === void 0 || value === "") {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}
function getEnvNumber(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
function getEnvBoolean(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}
function getEnvJson(key, defaultValue) {
  const value = process.env[key];
  if (value === void 0) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}
function createConfig(config) {
  const result = {};
  const prefix = config.prefix ? `${config.prefix}_` : "";
  for (const [key, varConfig] of Object.entries(config.vars)) {
    const envKey = `${prefix}${key}`;
    const rawValue = process.env[envKey];
    if (rawValue === void 0 || rawValue === "") {
      if (varConfig.required && config.strict !== false) {
        throw new Error(`Required environment variable ${envKey} is not set`);
      }
      if (varConfig.default !== void 0) {
        result[key] = varConfig.default;
        continue;
      }
      result[key] = void 0;
      continue;
    }
    if (varConfig.validator && !varConfig.validator(rawValue)) {
      throw new Error(`Invalid value for environment variable ${envKey}`);
    }
    if (varConfig.transform) {
      result[key] = varConfig.transform(rawValue);
      continue;
    }
    switch (varConfig.type) {
      case "number":
        const num = parseFloat(rawValue);
        if (isNaN(num)) {
          throw new Error(`Invalid number for environment variable ${envKey}`);
        }
        result[key] = num;
        break;
      case "boolean":
        result[key] = rawValue.toLowerCase() === "true" || rawValue === "1";
        break;
      case "json":
        try {
          result[key] = JSON.parse(rawValue);
        } catch {
          throw new Error(`Invalid JSON for environment variable ${envKey}`);
        }
        break;
      default:
        result[key] = rawValue;
    }
  }
  return result;
}
function validateConfig(config) {
  const errors = [];
  const warnings = [];
  const prefix = config.prefix ? `${config.prefix}_` : "";
  for (const [key, varConfig] of Object.entries(config.vars)) {
    const envKey = `${prefix}${key}`;
    const rawValue = process.env[envKey];
    if (rawValue === void 0 || rawValue === "") {
      if (varConfig.required) {
        errors.push(`Missing required: ${envKey}`);
      } else if (varConfig.default === void 0) {
        warnings.push(`Optional not set: ${envKey}`);
      }
      continue;
    }
    if (varConfig.validator && !varConfig.validator(rawValue)) {
      errors.push(`Invalid value: ${envKey}`);
    }
    if (varConfig.type === "number" && isNaN(parseFloat(rawValue))) {
      errors.push(`Invalid number: ${envKey}`);
    }
    if (varConfig.type === "json") {
      try {
        JSON.parse(rawValue);
      } catch {
        errors.push(`Invalid JSON: ${envKey}`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
function createServiceInfo(info) {
  return {
    ...info,
    capabilities: info.capabilities || [],
    endpoints: info.endpoints || {}
  };
}
function parsePrice(envVar, fallback) {
  if (!envVar) return fallback;
  const parsed = parseFloat(envVar);
  return isNaN(parsed) ? fallback : parsed;
}
function createPriceConfig(priceMap) {
  const result = {};
  for (const [key, config] of Object.entries(priceMap)) {
    result[key] = parsePrice(process.env[config.envKey], config.default);
  }
  return result;
}
function createRouteMapping(routes, prices) {
  const result = {};
  for (const route of routes) {
    result[route.path] = {
      path: route.path,
      price: prices[route.priceKey] || 0,
      description: route.description
    };
  }
  return result;
}
function getRoutePrice(routes, path) {
  const route = routes[path];
  return route?.price;
}
function createFeatureFlags(flags) {
  const result = {};
  for (const [key, config] of Object.entries(flags)) {
    const value = process.env[config.envKey];
    result[key] = value !== void 0 ? value.toLowerCase() === "true" || value === "1" : config.default;
  }
  return result;
}
function isFeatureEnabled(flags, feature) {
  return flags[feature] ?? false;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createConfig,
  createFeatureFlags,
  createPriceConfig,
  createRouteMapping,
  createServiceInfo,
  getEnv,
  getEnvBoolean,
  getEnvJson,
  getEnvNumber,
  getRequiredEnv,
  getRoutePrice,
  isFeatureEnabled,
  parsePrice,
  validateConfig
});
//# sourceMappingURL=index.js.map