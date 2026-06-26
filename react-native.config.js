module.exports = {
  dependencies: {
    // Health Connect requires Android API 26+. Exclude from Android autolinking
    // so the native module (and its connect-client AAR) is never compiled into
    // the Android build. On Android the JS require() throws, caught by getHC()
    // returning null. iOS is unaffected — HealthKit uses react-native-health.
    "react-native-health-connect": {
      platforms: {
        android: null,
      },
    },
  },
};
