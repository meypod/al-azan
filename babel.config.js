module.exports = {
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
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
