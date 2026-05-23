

import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY =
  "@eqaa_onboarding_complete";

export async function saveOnboardingComplete() {
  try {
    await AsyncStorage.setItem(
      ONBOARDING_KEY,
      "true"
    );
  } catch (error) {
    console.log(
      "saveOnboardingComplete error",
      error
    );
  }
}

export async function getOnboardingComplete() {
  try {
    const value =
      await AsyncStorage.getItem(
        ONBOARDING_KEY
      );

    return value === "true";
  } catch (error) {
    console.log(
      "getOnboardingComplete error",
      error
    );

    return false;
  }
}

export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem(
      ONBOARDING_KEY
    );
  } catch (error) {
    console.log(
      "resetOnboarding error",
      error
    );
  }
}