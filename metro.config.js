const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @anthropic-ai/sdk v0.95+ includes lib/credentials/credential-chain.mjs which
// dynamically imports node:fs for OAuth token file caching. That code path is
// never reached when using API-key auth (dangerouslyAllowBrowser: true), but
// Metro's static analyser still tries to resolve it and fails.
// Map all node: built-ins to empty modules so the bundle succeeds.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('node:')) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;