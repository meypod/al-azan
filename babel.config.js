module.exports = function (api) {
  api.cache(true);
  const config = {
    plugins: [
      ['macros'],
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
        },
      ],
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
    presets: ['module:metro-react-native-babel-preset'],
    comments: true,
  };

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.BABEL_ENV === 'production'
  ) {
    config.plugins.push(['transform-remove-console', {exclude: ['error']}]);
  }

  return config;
};
