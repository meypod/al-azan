/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

const defaultAssetExts =
  require('metro-config/src/defaults/defaults').assetExts;

module.exports = {
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
