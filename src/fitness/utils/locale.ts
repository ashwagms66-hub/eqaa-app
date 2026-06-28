export type AppLanguage = "ar" | "en";

export interface BilingualEntity {
  arabicName: string;
  englishName: string;
}

export function localizedName(entity: BilingualEntity, language: AppLanguage): string {
  return language === "ar" ? entity.arabicName : entity.englishName;
}

export function allNames(entity: BilingualEntity & { aliases?: string[] }): string[] {
  return [entity.arabicName, entity.englishName, ...(entity.aliases ?? [])];
}
