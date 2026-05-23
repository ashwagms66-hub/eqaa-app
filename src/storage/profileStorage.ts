import AsyncStorage from "@react-native-async-storage/async-storage";

const NAME_KEY = "@eqaa_name";
const LIFE_MODE_KEY = "@eqaa_life_mode";
const DARK_MODE_KEY = "@eqaa_dark_mode";
const GOALS_KEY = "@eqaa_goals";
const HEIGHT_KEY = "@eqaa_height";
const WEIGHT_KEY = "@eqaa_weight";
const AGE_KEY = "@eqaa_age";
const ACTIVITY_KEY = "@eqaa_activity";
const CALORIES_KEY = "@eqaa_calories";

export async function saveName(
  name: string
) {
  await AsyncStorage.setItem(
    NAME_KEY,
    name
  );
}

export async function getName() {
  const value =
    await AsyncStorage.getItem(
      NAME_KEY
    );

  return value || "";
}

export async function saveLifeMode(
  mode: string
) {
  await AsyncStorage.setItem(
    LIFE_MODE_KEY,
    mode
  );
}

export async function getLifeMode() {
  const value =
    await AsyncStorage.getItem(
      LIFE_MODE_KEY
    );

  return value || "regular";
}

export async function saveDarkMode(
  value: boolean
) {
  await AsyncStorage.setItem(
    DARK_MODE_KEY,
    JSON.stringify(value)
  );
}

export async function getDarkMode() {
  const value =
    await AsyncStorage.getItem(
      DARK_MODE_KEY
    );

  if (value === null) {
    return true;
  }

  return JSON.parse(value);
}

export async function saveGoals(
  goals: string[]
) {
  await AsyncStorage.setItem(
    GOALS_KEY,
    JSON.stringify(goals)
  );
}

export async function getGoals() {
  const value =
    await AsyncStorage.getItem(
      GOALS_KEY
    );

  if (!value) {
    return [];
  }

  return JSON.parse(value);
}
export async function saveHeight(
  value: number
) {
  await AsyncStorage.setItem(
    HEIGHT_KEY,
    value.toString()
  );
}

export async function getHeight() {
  const value =
    await AsyncStorage.getItem(
      HEIGHT_KEY
    );

  return value ? Number(value) : 163;
}

export async function saveWeight(
  value: number
) {
  await AsyncStorage.setItem(
    WEIGHT_KEY,
    value.toString()
  );
}

export async function getWeight() {
  const value =
    await AsyncStorage.getItem(
      WEIGHT_KEY
    );

  return value ? Number(value) : 68;
}

export async function saveAge(
  value: number
) {
  await AsyncStorage.setItem(
    AGE_KEY,
    value.toString()
  );
}

export async function getAge() {
  const value =
    await AsyncStorage.getItem(
      AGE_KEY
    );

  return value ? Number(value) : 26;
}

export async function saveActivityLevel(
  value: string
) {
  await AsyncStorage.setItem(
    ACTIVITY_KEY,
    value
  );
}

export async function getActivityLevel() {
  const value =
    await AsyncStorage.getItem(
      ACTIVITY_KEY
    );

  return value || "moderate";
}

export async function saveCalories(
  value: number
) {
  await AsyncStorage.setItem(
    CALORIES_KEY,
    value.toString()
  );
}

export async function getCalories() {
  const value =
    await AsyncStorage.getItem(
      CALORIES_KEY
    );

  return value ? Number(value) : 1400;
}
export async function clearProfileStorage() {
  await AsyncStorage.multiRemove([
    HEIGHT_KEY,
WEIGHT_KEY,
AGE_KEY,
ACTIVITY_KEY,
CALORIES_KEY,
    NAME_KEY,
    LIFE_MODE_KEY,
    DARK_MODE_KEY,
    GOALS_KEY,
  ]);
}