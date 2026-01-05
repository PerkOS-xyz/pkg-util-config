/**
 * @perkos/config
 * Configuration management utilities for PerkOS services
 */
interface EnvConfig<T extends Record<string, EnvVarConfig>> {
    vars: T;
    prefix?: string;
    strict?: boolean;
}
interface EnvVarConfig {
    required?: boolean;
    default?: string | number | boolean;
    type?: "string" | "number" | "boolean" | "json";
    validator?: (value: string) => boolean;
    transform?: (value: string) => unknown;
}
type ParsedConfig<T extends Record<string, EnvVarConfig>> = {
    [K in keyof T]: T[K]["type"] extends "number" ? number : T[K]["type"] extends "boolean" ? boolean : T[K]["type"] extends "json" ? unknown : string;
};
interface ConfigValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Get environment variable with optional default
 */
declare function getEnv(key: string, defaultValue?: string): string | undefined;
/**
 * Get required environment variable (throws if missing)
 */
declare function getRequiredEnv(key: string): string;
/**
 * Get environment variable as number
 */
declare function getEnvNumber(key: string, defaultValue?: number): number | undefined;
/**
 * Get environment variable as boolean
 */
declare function getEnvBoolean(key: string, defaultValue?: boolean): boolean | undefined;
/**
 * Get environment variable as JSON
 */
declare function getEnvJson<T>(key: string, defaultValue?: T): T | undefined;
/**
 * Create a typed configuration from environment variables
 */
declare function createConfig<T extends Record<string, EnvVarConfig>>(config: EnvConfig<T>): ParsedConfig<T>;
/**
 * Validate configuration without creating it
 */
declare function validateConfig<T extends Record<string, EnvVarConfig>>(config: EnvConfig<T>): ConfigValidationResult;
interface ServiceInfo {
    name: string;
    version: string;
    description?: string;
    capabilities?: string[];
    endpoints?: Record<string, EndpointInfo>;
}
interface EndpointInfo {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    description?: string;
    price?: number;
    rateLimit?: number;
}
/**
 * Create service discovery info
 */
declare function createServiceInfo(info: ServiceInfo): ServiceInfo;
interface PriceConfig {
    [key: string]: number;
}
/**
 * Parse price from environment variable with fallback
 */
declare function parsePrice(envVar: string | undefined, fallback: number): number;
/**
 * Create price configuration from environment
 */
declare function createPriceConfig(priceMap: Record<string, {
    envKey: string;
    default: number;
}>): PriceConfig;
interface RouteConfig {
    path: string;
    price: number;
    description?: string;
    rateLimit?: number;
}
/**
 * Create route price mapping from price config
 */
declare function createRouteMapping(routes: Array<{
    path: string;
    priceKey: string;
    description?: string;
}>, prices: PriceConfig): Record<string, RouteConfig>;
/**
 * Get price for a route path
 */
declare function getRoutePrice(routes: Record<string, RouteConfig>, path: string): number | undefined;
interface FeatureFlags {
    [key: string]: boolean;
}
/**
 * Create feature flags from environment
 */
declare function createFeatureFlags(flags: Record<string, {
    envKey: string;
    default: boolean;
}>): FeatureFlags;
/**
 * Check if a feature is enabled
 */
declare function isFeatureEnabled(flags: FeatureFlags, feature: string): boolean;

export { type ConfigValidationResult, type EndpointInfo, type EnvConfig, type EnvVarConfig, type FeatureFlags, type ParsedConfig, type PriceConfig, type RouteConfig, type ServiceInfo, createConfig, createFeatureFlags, createPriceConfig, createRouteMapping, createServiceInfo, getEnv, getEnvBoolean, getEnvJson, getEnvNumber, getRequiredEnv, getRoutePrice, isFeatureEnabled, parsePrice, validateConfig };
