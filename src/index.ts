/**
 * @perkos/config
 * Configuration management utilities for PerkOS services
 */

// ============================================================================
// Types
// ============================================================================

export interface EnvConfig<T extends Record<string, EnvVarConfig>> {
  vars: T;
  prefix?: string;
  strict?: boolean;
}

export interface EnvVarConfig {
  required?: boolean;
  default?: string | number | boolean;
  type?: "string" | "number" | "boolean" | "json";
  validator?: (value: string) => boolean;
  transform?: (value: string) => unknown;
}

export type ParsedConfig<T extends Record<string, EnvVarConfig>> = {
  [K in keyof T]: T[K]["type"] extends "number"
    ? number
    : T[K]["type"] extends "boolean"
    ? boolean
    : T[K]["type"] extends "json"
    ? unknown
    : string;
};

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Environment Variable Utilities
// ============================================================================

/**
 * Get environment variable with optional default
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}

/**
 * Get required environment variable (throws if missing)
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue?: number): number | undefined {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(key: string, defaultValue?: boolean): boolean | undefined {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Get environment variable as JSON
 */
export function getEnvJson<T>(key: string, defaultValue?: T): T | undefined {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// Configuration Builder
// ============================================================================

/**
 * Create a typed configuration from environment variables
 */
export function createConfig<T extends Record<string, EnvVarConfig>>(
  config: EnvConfig<T>
): ParsedConfig<T> {
  const result: Record<string, unknown> = {};
  const prefix = config.prefix ? `${config.prefix}_` : "";

  for (const [key, varConfig] of Object.entries(config.vars)) {
    const envKey = `${prefix}${key}`;
    const rawValue = process.env[envKey];

    // Handle missing values
    if (rawValue === undefined || rawValue === "") {
      if (varConfig.required && config.strict !== false) {
        throw new Error(`Required environment variable ${envKey} is not set`);
      }
      if (varConfig.default !== undefined) {
        result[key] = varConfig.default;
        continue;
      }
      result[key] = undefined;
      continue;
    }

    // Validate
    if (varConfig.validator && !varConfig.validator(rawValue)) {
      throw new Error(`Invalid value for environment variable ${envKey}`);
    }

    // Transform or parse by type
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

  return result as ParsedConfig<T>;
}

/**
 * Validate configuration without creating it
 */
export function validateConfig<T extends Record<string, EnvVarConfig>>(
  config: EnvConfig<T>
): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = config.prefix ? `${config.prefix}_` : "";

  for (const [key, varConfig] of Object.entries(config.vars)) {
    const envKey = `${prefix}${key}`;
    const rawValue = process.env[envKey];

    if (rawValue === undefined || rawValue === "") {
      if (varConfig.required) {
        errors.push(`Missing required: ${envKey}`);
      } else if (varConfig.default === undefined) {
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
    warnings,
  };
}

// ============================================================================
// Service Discovery Configuration
// ============================================================================

export interface ServiceInfo {
  name: string;
  version: string;
  description?: string;
  capabilities?: string[];
  endpoints?: Record<string, EndpointInfo>;
}

export interface EndpointInfo {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description?: string;
  price?: number;
  rateLimit?: number;
}

/**
 * Create service discovery info
 */
export function createServiceInfo(info: ServiceInfo): ServiceInfo {
  return {
    ...info,
    capabilities: info.capabilities || [],
    endpoints: info.endpoints || {},
  };
}

// ============================================================================
// Price Configuration
// ============================================================================

export interface PriceConfig {
  [key: string]: number;
}

/**
 * Parse price from environment variable with fallback
 */
export function parsePrice(envVar: string | undefined, fallback: number): number {
  if (!envVar) return fallback;
  const parsed = parseFloat(envVar);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Create price configuration from environment
 */
export function createPriceConfig(
  priceMap: Record<string, { envKey: string; default: number }>
): PriceConfig {
  const result: PriceConfig = {};
  for (const [key, config] of Object.entries(priceMap)) {
    result[key] = parsePrice(process.env[config.envKey], config.default);
  }
  return result;
}

// ============================================================================
// Route Configuration
// ============================================================================

export interface RouteConfig {
  path: string;
  price: number;
  description?: string;
  rateLimit?: number;
}

/**
 * Create route price mapping from price config
 */
export function createRouteMapping(
  routes: Array<{ path: string; priceKey: string; description?: string }>,
  prices: PriceConfig
): Record<string, RouteConfig> {
  const result: Record<string, RouteConfig> = {};
  for (const route of routes) {
    result[route.path] = {
      path: route.path,
      price: prices[route.priceKey] || 0,
      description: route.description,
    };
  }
  return result;
}

/**
 * Get price for a route path
 */
export function getRoutePrice(
  routes: Record<string, RouteConfig>,
  path: string
): number | undefined {
  const route = routes[path];
  return route?.price;
}

// ============================================================================
// Feature Flags
// ============================================================================

export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Create feature flags from environment
 */
export function createFeatureFlags(
  flags: Record<string, { envKey: string; default: boolean }>
): FeatureFlags {
  const result: FeatureFlags = {};
  for (const [key, config] of Object.entries(flags)) {
    const value = process.env[config.envKey];
    result[key] =
      value !== undefined
        ? value.toLowerCase() === "true" || value === "1"
        : config.default;
  }
  return result;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  flags: FeatureFlags,
  feature: string
): boolean {
  return flags[feature] ?? false;
}
