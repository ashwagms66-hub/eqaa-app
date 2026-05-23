import DayModal from "@/components/calendar/DayModal";
import { generateMonthCalendar } from "@/src/engine/calendarEngine";
import {
  getAllCheckIns,
} from "@/src/storage/checkinStorage";
import { BlurView } from "expo-blur";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_SIZE = (SCREEN_WIDTH - 40) / 7;

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const PERIOD_COLOR = "#FF6FAE";
const FERTILE_COLOR = "#C6A7FF";
const OVULATION_COLOR = "#F7D58D";

export default function MonthCalendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [pressedDate, setPressedDate] = useState("");
  const [checkIns, setCheckIns] = useState<
    Record<string, any>
  >({});

  const lastPeriodStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    2
  );

  const monthDays = useMemo(() => {
    return generateMonthCalendar(
      currentYear,
      currentMonth,
      lastPeriodStart,
      28,
      5
    );
  }, [currentMonth, currentYear]);

  const loadCheckIns = useCallback(async () => {
    try {
      const data = await getAllCheckIns();

      setCheckIns(data);
    } catch (error) {
      console.log(
        "Error loading calendar indicators:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadCheckIns();
  }, [modalVisible]);

  function goNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  }

  function goPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  }

  function openDayModal(date: string) {
    setSelectedDate(date);
    setPressedDate(date);
    setModalVisible(true);
  }

  function closeDayModal() {
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.blurCard}>
        <View style={styles.header}>
          <Pressable onPress={goPrevMonth} style={styles.iconButton}>
            <ChevronLeft color="#FFFFFF" size={20} />
          </Pressable>

          <Text style={styles.monthTitle}>
            {new Date(currentYear, currentMonth).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </Text>

          <Pressable onPress={goNextMonth} style={styles.iconButton}>
            <ChevronRight color="#FFFFFF" size={20} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEK_DAYS.map((day, index) => (
  <Text
    key={`${day}-${index}`}
    style={styles.weekDay}
  >
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {monthDays.map((day, index) => {
            const todayState = day.isToday;
            const periodState = day.isPeriod;
            const fertileState = day.isFertile;
            const ovulationState = day.isOvulation;

            const hasCheckIn = !!checkIns[day.iso];

            const moodSaved =
              checkIns[day.iso]?.mood;

            const symptomCount =
              checkIns[day.iso]?.symptoms
                ?.length || 0;

            let backgroundColor = "transparent";
            let borderColor = "rgba(255,255,255,0.06)";

            if (periodState) {
              backgroundColor = PERIOD_COLOR;
            }

            if (fertileState) {
              backgroundColor = FERTILE_COLOR;
            }

            if (ovulationState) {
              backgroundColor = OVULATION_COLOR;
            }

            return (
              <View key={index}>
                <Pressable
                  onPress={() => openDayModal(day.iso)}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor,
                      borderColor,
                    },
                    !day.isCurrentMonth && styles.outsideMonth,
                    day.isFuture && styles.futureDay,
                    todayState && styles.todayGlow,
                    pressedDate === day.iso &&
                      styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      ovulationState && styles.darkText,
                      pressedDate === day.iso &&
                        styles.selectedDayText,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>

                  {hasCheckIn && (
                    <View style={styles.indicatorWrapper}>
                      <View
                        style={styles.checkInDot}
                      />

                      {!!moodSaved && (
                        <View
                          style={styles.moodDot}
                        />
                      )}

                      {symptomCount > 0 && (
                        <View
                          style={styles.symptomDot}
                        />
                      )}
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: PERIOD_COLOR },
              ]}
            />
            <Text style={styles.legendText}>Period</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: FERTILE_COLOR },
              ]}
            />
            <Text style={styles.legendText}>Fertile</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: OVULATION_COLOR },
              ]}
            />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
        </View>
      </BlurView>

      <DayModal
        visible={modalVisible}
        selectedDate={selectedDate}
        onClose={closeDayModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  blurCard: {
    overflow: "hidden",
    borderRadius: 36,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  monthTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weekDay: {
    width: CELL_SIZE,
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayCell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    margin: 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.015)",
  },
  dayText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  darkText: {
    color: "#111111",
  },
  todayGlow: {
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderColor: "rgba(255,255,255,0.6)",
  },
  outsideMonth: {
    opacity: 0.25,
  },
  futureDay: {
    opacity: 0.82,
  },
  selectedDay: {
    borderColor: "#C6A7FF",
    borderWidth: 2,
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    transform: [{ scale: 1.04 }],
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  indicatorWrapper: {
    position: "absolute",
    bottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  checkInDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
  },
  moodDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#8EF0C8",
  },
  symptomDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#FF6FAE",
  },
  legendContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
  },
});