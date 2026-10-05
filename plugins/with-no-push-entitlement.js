// Free Apple IDs (used by AltStore sideloading) can't sign the Push Notifications
// capability. Downtime only uses *local* notifications, so drop the entitlement
// that expo-notifications adds.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withNoPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
