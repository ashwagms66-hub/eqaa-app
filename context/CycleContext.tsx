import React, { createContext, useContext, useState } from "react";

type CycleData = {
  lastPeriodDate: string | null;
  setLastPeriodDate: (date: string) => void;
};

const CycleContext = createContext<CycleData | undefined>(undefined);

export const CycleProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);

  return (
    <CycleContext.Provider value={{ lastPeriodDate, setLastPeriodDate }}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error("useCycle must be used inside CycleProvider");
  }
  return context;
};