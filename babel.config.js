const getSourceLocatorPlugins = (shouldEnable) => {
  if (!shouldEnable) {
    return [];
  }

  const { rnSourceLocator } = require('@metagptx/vite-plugin-source-locator/rn');
  return [rnSourceLocator()];
};

module.exports = function (api) {
  const isWebBuild =
    api.caller((caller) => caller?.platform === 'web') ||
    process.env.EXPO_OS === 'web';

  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      ...getSourceLocatorPlugins(isWebBuild),
    ],
  };
};
