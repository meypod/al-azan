const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

const defaultAssetExts =
  require('metro-config/src/defaults/defaults').assetExts;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        // experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: [...defaultAssetExts, 'txt'],
    sourceExts: process.env.RN_SRC_EXT
      ? [...process.env.RN_SRC_EXT.split(',').concat(defaultSourceExts), 'mjs']
      : [...defaultSourceExts, 'mjs'],
    resolveRequest(context, moduleName, platform) {
      if (moduleName.startsWith('@lingui/core/compile')) {
        moduleName = moduleName.replace(
          '@lingui/core/compile',
          '@lingui/core/build/esm/compile.js',
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
