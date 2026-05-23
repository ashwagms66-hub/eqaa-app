import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { translations } from "@/src/localization/translations";

const LANGUAGE_KEY =
  "@eqaa_language";

type Language = "ar" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (
    language: Language
  ) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (typeof translations)[Language];
};

const LanguageContext =
  createContext<LanguageContextType>({
    language: "ar",
    setLanguage: async () => {},
    toggleLanguage: async () => {},
    t: translations.ar,
  });

type Props = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: Props) {
  const [language, setLanguageState] =
    useState<Language>("ar");

  useEffect(() => {
    async function loadLanguage() {
      const savedLanguage =
        await AsyncStorage.getItem(
          LANGUAGE_KEY
        );

      if (
        savedLanguage === "ar" ||
        savedLanguage === "en"
      ) {
        setLanguageState(savedLanguage);
      }
    }

    loadLanguage();
  }, []);

  async function setLanguage(
    nextLanguage: Language
  ) {
    setLanguageState(nextLanguage);

    await AsyncStorage.setItem(
      LANGUAGE_KEY,
      nextLanguage
    );
  }

  async function toggleLanguage() {
    const nextLanguage =
      language === "ar"
        ? "en"
        : "ar";

    await setLanguage(nextLanguage);
  }

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}