import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PERIOD_KEY =
  "@eqaa_last_period";

const CYCLE_LENGTH_KEY =
  "@eqaa_cycle_length";

export async function saveLastPeriod(
  date: string
) {
  await AsyncStorage.setItem(
    LAST_PERIOD_KEY,
    date
  );
}

export async function getLastPeriod() {
  return AsyncStorage.getItem(
    LAST_PERIOD_KEY
  );
}

export async function saveCycleLength(
  length: number
) {
  await AsyncStorage.setItem(
    CYCLE_LENGTH_KEY,
    length.toString()
  );
}

export async function getCycleLength() {
  const value =
    await AsyncStorage.getItem(
      CYCLE_LENGTH_KEY
    );

  return value ? Number(value) : 28;
}

const PERIOD_LENGTH_KEY = "@eqaa_period_length";

export async function savePeriodLength(length: number) {
  await AsyncStorage.setItem(PERIOD_LENGTH_KEY, length.toString());
}

export async function getPeriodLength() {
  const value = await AsyncStorage.getItem(PERIOD_LENGTH_KEY);
  return value ? Number(value) : 5;
}