// Configuração do Metro (bundler do Expo).
// Necessária para o expo-sqlite funcionar na versão web: ele usa um arquivo .wasm
// e precisa dos cabeçalhos COOP/COEP para liberar o SharedArrayBuffer no navegador.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  return middleware(req, res, next);
};

module.exports = config;
