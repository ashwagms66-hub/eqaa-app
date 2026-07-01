import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type PurchasesOfferings, type PurchasesPackage } from "react-native-purchases";
import {
  getOfferings,
  getCustomerInfo,
  isPremiumActive,
  purchasePackage,
  restorePurchases,
} from "@/src/services/subscriptionService";

const CACHE_KEY = "@eqaa_premium_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PremiumCache {
  isPremium: boolean;
  timestamp: number;
}

async function readCache(): Promise<boolean | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as PremiumCache;
    if (Date.now() - cache.timestamp > CACHE_TTL_MS) return null;
    return cache.isPremium;
  } catch {
    return null;
  }
}

async function writeCache(isPremium: boolean): Promise<void> {
  try {
    const cache: PremiumCache = { isPremium, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
}

export async function invalidatePremiumCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UseSubscriptionResult {
  isPremium: boolean;
  loading: boolean;
  offerings: PurchasesOfferings | null;
  monthlyPackage: PurchasesPackage | null;
  yearlyPackage: PurchasesPackage | null;
  purchaseMonthly: () => Promise<"success" | "cancelled" | "error">;
  purchaseYearly: () => Promise<"success" | "cancelled" | "error">;
  restore: () => Promise<"restored" | "none" | "error">;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [yearlyPackage, setYearlyPackage] = useState<PurchasesPackage | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Fast path: serve from cache
      const cached = await readCache();
      if (cached !== null) {
        setIsPremium(cached);
        setLoading(false);
      }

      // Background refresh from RevenueCat
      const [active, off] = await Promise.all([isPremiumActive(), getOfferings()]);
      setIsPremium(active);
      await writeCache(active);

      if (off) {
        setOfferings(off);
        const pkgs = off.current?.availablePackages ?? [];
        setMonthlyPackage(
          pkgs.find((p) => p.product.identifier === "eqaa_premium_monthly") ??
            pkgs.find((p) => p.packageType === "MONTHLY") ??
            null
        );
        setYearlyPackage(
          pkgs.find((p) => p.product.identifier === "eqaa_premium_yearly") ??
            pkgs.find((p) => p.packageType === "ANNUAL") ??
            null
        );
      }
    } catch { /* stay with current state */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchaseMonthly = useCallback(async (): Promise<"success" | "cancelled" | "error"> => {
    if (!monthlyPackage) return "error";
    const result = await purchasePackage(monthlyPackage);
    if (result.success) {
      setIsPremium(true);
      await writeCache(true);
      return "success";
    }
    return result.userCancelled ? "cancelled" : "error";
  }, [monthlyPackage]);

  const purchaseYearly = useCallback(async (): Promise<"success" | "cancelled" | "error"> => {
    if (!yearlyPackage) return "error";
    const result = await purchasePackage(yearlyPackage);
    if (result.success) {
      setIsPremium(true);
      await writeCache(true);
      return "success";
    }
    return result.userCancelled ? "cancelled" : "error";
  }, [yearlyPackage]);

  const restore = useCallback(async (): Promise<"restored" | "none" | "error"> => {
    try {
      const info = await restorePurchases();
      if (!info) return "error";
      const active = info.entitlements.active["premium"] !== undefined;
      setIsPremium(active);
      await writeCache(active);
      return active ? "restored" : "none";
    } catch {
      return "error";
    }
  }, []);

  return {
    isPremium,
    loading,
    offerings,
    monthlyPackage,
    yearlyPackage,
    purchaseMonthly,
    purchaseYearly,
    restore,
    refresh,
  };
}
