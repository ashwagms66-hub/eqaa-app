import { useState, useEffect, useCallback } from "react";
import { Vibration } from "react-native";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import { workoutRepository } from "../repository";
import { workoutSessionService } from "../services/WorkoutSessionService";

export type WorkoutPhase = "loading" | "working" | "resting" | "done" | "error";

export interface UseWorkoutSessionResult {
  session: WorkoutSession | null;
  exercise: WorkoutExercise | null;
  currentSetNumber: number;
  targetSets: number;
  restSecondsLeft: number | null;
  phase: WorkoutPhase;
  finishSet: (reps: number, weight: number | null) => Promise<void>;
  skipRest: () => void;
  finishWorkout: () => Promise<void>;
  abandonWorkout: () => Promise<void>;
}

export function useWorkoutSession(sessionId: string): UseWorkoutSessionResult {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [phase, setPhase] = useState<WorkoutPhase>("loading");
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPhase("error");
      return;
    }
    workoutRepository.getById(sessionId).then((s) => {
      if (!s) {
        setPhase("error");
        return;
      }
      setSession(s);
      setPhase(s.status === "completed" ? "done" : "working");
    });
  }, [sessionId]);

  useEffect(() => {
    if (restSecondsLeft === null) return;

    if (restSecondsLeft <= 0) {
      Vibration.vibrate([0, 200, 100, 200]);
      setPhase("working");
      setRestSecondsLeft(null);
      return;
    }

    const t = setTimeout(
      () => setRestSecondsLeft((s) => (s !== null ? s - 1 : null)),
      1000
    );
    return () => clearTimeout(t);
  }, [restSecondsLeft]);

  const exercise = session?.exercises[0] ?? null;
  const currentSetNumber = (exercise?.sets.length ?? 0) + 1;
  const targetSets = exercise?.targetSets ?? 0;

  const finishSet = useCallback(
    async (reps: number, weight: number | null) => {
      if (!session || !exercise || phase !== "working") return;

      const updated = await workoutSessionService.addSet(session.id, exercise.id, {
        setNumber: currentSetNumber,
        reps,
        weight,
        durationSeconds: null,
        restTakenSeconds: 0,
        rpe: null,
      });

      setSession(updated);
      const completedSets = updated.exercises[0]?.sets.length ?? 0;

      if (completedSets >= targetSets) {
        setPhase("done");
      } else {
        setPhase("resting");
        setRestSecondsLeft(exercise.targetRestSeconds);
      }
    },
    [session, exercise, phase, currentSetNumber, targetSets]
  );

  const skipRest = useCallback(() => {
    setRestSecondsLeft(null);
    setPhase("working");
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!session) return;
    const updated = await workoutSessionService.completeSession(session.id);
    setSession(updated);
    setPhase("done");
  }, [session]);

  const abandonWorkout = useCallback(async () => {
    if (!session) return;
    await workoutSessionService.abandonSession(session.id);
  }, [session]);

  return {
    session,
    exercise,
    currentSetNumber,
    targetSets,
    restSecondsLeft,
    phase,
    finishSet,
    skipRest,
    finishWorkout,
    abandonWorkout,
  };
}
