export type AnalyticsInput = {
  moodHistory?: string[];
  symptoms?: string[];
  sleepHours?: number;
  stressLevel?: "Low" | "Medium" | "High";
  cycleLength?: number;
  completedCheckins?: number;
  consistencyScore?: number;
};

export type AnalyticsOutput = {
  emotionalBalance: number;
  energyRhythm: number;
  rhythmScore: number;
  emotionalState: string;
};

export function generateAnalytics(
  input: AnalyticsInput
): AnalyticsOutput {
  const {
    moodHistory = [],
    symptoms = [],
    sleepHours = 7,
    stressLevel = "Low",
    cycleLength = 28,
    completedCheckins = 5,
    consistencyScore = 80,
  } = input;

  let emotionalBalance = 82;
  let energyRhythm = 74;
  let rhythmScore = 8.7;

  if (stressLevel === "High") {
    emotionalBalance -= 18;
    rhythmScore -= 1.2;
  }

  if (stressLevel === "Medium") {
    emotionalBalance -= 8;
    rhythmScore -= 0.5;
  }

  if (sleepHours <= 5) {
    energyRhythm -= 24;
    rhythmScore -= 1.1;
  } else if (sleepHours <= 6) {
    energyRhythm -= 12;
    rhythmScore -= 0.4;
  }

  if (symptoms.includes("Fatigue")) {
    energyRhythm -= 10;
  }

  if (symptoms.includes("Mood Swing")) {
    emotionalBalance -= 9;
  }

  if (symptoms.includes("Cramps")) {
    rhythmScore -= 0.3;
  }

  if (completedCheckins >= 6) {
    rhythmScore += 0.4;
  }

  if (consistencyScore >= 90) {
    rhythmScore += 0.6;
  }

  if (
    cycleLength < 24 ||
    cycleLength > 35
  ) {
    rhythmScore -= 0.5;
  }

  const positiveMoods = moodHistory.filter(
    (mood) =>
      mood === "Happy" ||
      mood === "Calm" ||
      mood === "Focused"
  ).length;

  const negativeMoods = moodHistory.filter(
    (mood) =>
      mood === "Anxious" ||
      mood === "Overwhelmed" ||
      mood === "Sad"
  ).length;

  emotionalBalance += positiveMoods * 2;
  emotionalBalance -= negativeMoods * 3;

  emotionalBalance = Math.max(
    0,
    Math.min(100, emotionalBalance)
  );

  energyRhythm = Math.max(
    0,
    Math.min(100, energyRhythm)
  );

  rhythmScore = Math.max(
    0,
    Math.min(10, rhythmScore)
  );

  let emotionalState = "Balanced";

  if (emotionalBalance >= 85) {
    emotionalState = "Aligned";
  } else if (emotionalBalance <= 55) {
    emotionalState = "Sensitive";
  }

  return {
    emotionalBalance:
      Math.round(emotionalBalance),

    energyRhythm:
      Math.round(energyRhythm),

    rhythmScore:
      Number(rhythmScore.toFixed(1)),

    emotionalState,
  };
}
