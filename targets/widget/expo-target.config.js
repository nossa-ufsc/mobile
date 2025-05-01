/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  icon: 'icon.png',
  entitlements: {
    'com.apple.security.application-groups': ['group.nossa-ufsc.data'],
  },
});
