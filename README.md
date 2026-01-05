# @perkos/util-config

Configuration management utilities for PerkOS services.

## Installation

```bash
npm install @perkos/util-config
```

## Usage

### Basic Environment Variables

```typescript
import {
  getEnv,
  getRequiredEnv,
  getEnvNumber,
  getEnvBoolean,
  getEnvJson,
} from "@perkos/util-config";

// Get optional env var with default
const apiUrl = getEnv("API_URL", "http://localhost:3000");

// Get required env var (throws if missing)
const apiKey = getRequiredEnv("API_KEY");

// Get as number
const port = getEnvNumber("PORT", 3000);

// Get as boolean
const debug = getEnvBoolean("DEBUG", false);

// Get as parsed JSON
const config = getEnvJson<{ key: string }>("CONFIG_JSON");
```

### Typed Configuration Builder

```typescript
import { createConfig, validateConfig } from "@perkos/util-config";

// Define configuration schema
const config = createConfig({
  prefix: "APP",
  strict: true,
  vars: {
    API_KEY: { required: true, type: "string" },
    PORT: { type: "number", default: 3000 },
    DEBUG: { type: "boolean", default: false },
    SETTINGS: { type: "json", default: {} },
    NETWORK: {
      required: true,
      validator: (v) => ["mainnet", "testnet"].includes(v),
    },
  },
});

// config is typed: { API_KEY: string, PORT: number, DEBUG: boolean, ... }

// Validate without creating
const result = validateConfig({
  prefix: "APP",
  vars: {
    API_KEY: { required: true },
    PORT: { type: "number" },
  },
});

if (!result.valid) {
  console.error("Config errors:", result.errors);
  console.warn("Warnings:", result.warnings);
}
```

### Price Configuration

```typescript
import { parsePrice, createPriceConfig, createRouteMapping } from "@perkos/util-config";

// Parse single price
const price = parsePrice(process.env.PRICE_USD, 0.01);

// Create price config from env
const prices = createPriceConfig({
  analyze: { envKey: "AI_ANALYZE_PRICE_USD", default: 0.05 },
  generate: { envKey: "AI_GENERATE_PRICE_USD", default: 0.15 },
  transcribe: { envKey: "AI_TRANSCRIBE_PRICE_USD", default: 0.04 },
});

// Create route mappings
const routes = createRouteMapping(
  [
    { path: "/api/ai/analyze", priceKey: "analyze" },
    { path: "/api/ai/generate", priceKey: "generate" },
    { path: "/api/ai/transcribe", priceKey: "transcribe" },
  ],
  prices
);

// Get price for route
import { getRoutePrice } from "@perkos/util-config";
const price = getRoutePrice(routes, "/api/ai/analyze"); // 0.05
```

### Service Discovery

```typescript
import { createServiceInfo } from "@perkos/util-config";

const serviceInfo = createServiceInfo({
  name: "My AI Service",
  version: "1.0.0",
  description: "AI-powered services with micropayments",
  capabilities: [
    "image-analysis",
    "image-generation",
    "text-summarization",
  ],
  endpoints: {
    analyze: {
      path: "/api/ai/analyze",
      method: "POST",
      description: "Analyze images",
      price: 0.05,
    },
  },
});
```

### Feature Flags

```typescript
import { createFeatureFlags, isFeatureEnabled } from "@perkos/util-config";

const flags = createFeatureFlags({
  newUI: { envKey: "FEATURE_NEW_UI", default: false },
  betaAPI: { envKey: "FEATURE_BETA_API", default: false },
  analytics: { envKey: "FEATURE_ANALYTICS", default: true },
});

if (isFeatureEnabled(flags, "newUI")) {
  // Show new UI
}
```

## API Reference

### Environment Utilities

| Function | Description |
|----------|-------------|
| `getEnv(key, default?)` | Get env var with optional default |
| `getRequiredEnv(key)` | Get required env var (throws if missing) |
| `getEnvNumber(key, default?)` | Get env var as number |
| `getEnvBoolean(key, default?)` | Get env var as boolean |
| `getEnvJson(key, default?)` | Get env var as parsed JSON |

### Configuration Builder

| Function | Description |
|----------|-------------|
| `createConfig(config)` | Create typed config from env vars |
| `validateConfig(config)` | Validate config without creating |

### Price Configuration

| Function | Description |
|----------|-------------|
| `parsePrice(envVar, fallback)` | Parse price with fallback |
| `createPriceConfig(priceMap)` | Create price config from env |
| `createRouteMapping(routes, prices)` | Map routes to prices |
| `getRoutePrice(routes, path)` | Get price for route |

### Service Discovery

| Function | Description |
|----------|-------------|
| `createServiceInfo(info)` | Create service discovery info |

### Feature Flags

| Function | Description |
|----------|-------------|
| `createFeatureFlags(flags)` | Create feature flags from env |
| `isFeatureEnabled(flags, feature)` | Check if feature is enabled |

## License

MIT
