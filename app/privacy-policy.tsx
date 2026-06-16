import { useLanguage } from "@/src/context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AR = {
  back: "رجوع",
  title: "سياسة الخصوصية",
  updated: "آخر تحديث: مايو ٢٠٢٦",
  sections: [
    {
      heading: "١. نظرة عامة",
      body: "إيقاع (Eqa'a) تطبيق صحي توعوي مصمم للمرأة لمتابعة دورتها الشهرية ونمط حياتها. نحن نأخذ خصوصيتك على محمل الجد.",
    },
    {
      heading: "٢. البيانات التي نجمعها",
      body: "يخزّن التطبيق بياناتك محلياً على جهازك فقط، وتشمل:\n• تواريخ الدورة الشهرية\n• تسجيلات الأعراض والمزاج\n• إعدادات الملف الشخصي (الطول، الوزن، مستوى النشاط)\n• تفضيلات اللغة\n\nلا يتم رفع أي بيانات إلى خوادم خارجية.",
    },
    {
      heading: "٣. كيف نستخدم البيانات",
      body: "تُستخدم البيانات حصراً لعرض توقعات الدورة والاقتراحات داخل التطبيق. لا تُشارك بياناتك مع أي طرف ثالث.",
    },
    {
      heading: "٤. الإشعارات",
      body: "إذا منحتِ إذن الإشعارات، يستخدمها التطبيق لإرسال تذكيرات محلية فقط. لا يتم إرسال أي بيانات عبر الإشعارات.",
    },
    {
      heading: "٥. حذف البيانات",
      body: "يمكنك حذف جميع بياناتك في أي وقت عبر إلغاء تثبيت التطبيق. لا توجد بيانات محفوظة خارج جهازك.",
    },
    {
      heading: "٦. إخلاء المسؤولية الطبية",
      body: "إيقاع تطبيق توعوي ولا يُقدّم تشخيصاً طبياً أو علاجاً أو نصائح صحية احترافية. استشيري طبيبك دائماً لأي قرارات صحية.",
    },
    {
      heading: "٧. التواصل",
      body: "لأي استفسارات حول الخصوصية، يمكنك التواصل معنا عبر:\neqaaapp@gmail.com",
    },
  ],
};

const EN = {
  back: "Back",
  title: "Privacy Policy",
  updated: "Last updated: May 2026",
  sections: [
    {
      heading: "1. Overview",
      body: "Eqa'a is a women's wellness app designed to help track menstrual cycles and daily habits. We take your privacy seriously.",
    },
    {
      heading: "2. Data We Collect",
      body: "All data is stored locally on your device only, including:\n• Menstrual cycle dates\n• Symptom and mood logs\n• Profile settings (height, weight, activity level)\n• Language preference\n\nNo data is transmitted to any external server.",
    },
    {
      heading: "3. How We Use Data",
      body: "Data is used exclusively to display cycle predictions and in-app suggestions. Your data is never shared with any third party.",
    },
    {
      heading: "4. Notifications",
      body: "If you grant notification permission, the app uses it only to send local reminders on your device. No data is transmitted via notifications.",
    },
    {
      heading: "5. Deleting Your Data",
      body: "You can delete all your data at any time by uninstalling the app. No data is stored outside your device.",
    },
    {
      heading: "6. Medical Disclaimer",
      body: "Eqa'a is an educational wellness app and does not provide medical advice, diagnosis, or treatment. Always consult a healthcare professional for medical decisions.",
    },
    {
      heading: "7. Contact",
      body: "For privacy inquiries, contact us at:\neqaaapp@gmail.com",
    },
  ],
};

export default function PrivacyPolicyScreen() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = isArabic ? AR : EN;

  return (
    <LinearGradient colors={["#05050A", "#171726", "#1E1530"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, isArabic && styles.rtl]}>{t.title}</Text>
          <Text style={[styles.updated, isArabic && styles.rtl]}>{t.updated}</Text>

          {t.sections.map((section, i) => (
            <View key={i} style={styles.section}>
              <Text style={[styles.heading, isArabic && styles.rtl]}>{section.heading}</Text>
              <Text style={[styles.body, isArabic && styles.rtl]}>{section.body}</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={[styles.footerText, isArabic && styles.rtl]}>
              {isArabic
                ? "باستخدامك للتطبيق، توافقين على هذه السياسة."
                : "By using this app, you agree to this policy."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    gap: 8,
  },
  backArrow: { color: "#FFFFFF", fontSize: 17 },
  backText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 60,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  updated: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 32,
  },

  section: {
    marginBottom: 28,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heading: {
    color: "#C6A7FF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  body: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 24,
  },

  footer: {
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(198,167,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.15)",
  },
  footerText: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
  },

  rtl: { textAlign: "right", writingDirection: "rtl" },
});
