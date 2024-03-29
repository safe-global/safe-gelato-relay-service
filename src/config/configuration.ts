import { SupportedChainId } from './constants';

const API_KEYS: Record<SupportedChainId, string | undefined> = {
  [SupportedChainId.GOERLI]: process.env.GELATO_GOERLI_API_KEY,
  [SupportedChainId.GNOSIS_CHAIN]: process.env.GELATO_GNOSIS_CHAIN_API_KEY,
  [SupportedChainId.SEPOLIA]: process.env.GELATO_SEPOLIA_API_KEY,
};

export default () => ({
  about: {
    name: 'safe-gelato-relay-service',
    version: process.env.APPLICATION_VERSION,
    buildNumber: process.env.APPLICATION_BUILD_NUMBER,
  },
  applicationPort: process.env.APPLICATION_PORT || '3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
  relay: {
    ttl: process.env.THROTTLE_TTL ? +process.env.THROTTLE_TTL : 60 * 60, // 1 hour in seconds
    limit: process.env.THROTTLE_LIMIT ? +process.env.THROTTLE_LIMIT : 5,
  },
  gelato: {
    apiKey: API_KEYS,
  },
  gatewayUrl: process.env.GATEWAY_URL || 'https://safe-client.safe.global',
});
