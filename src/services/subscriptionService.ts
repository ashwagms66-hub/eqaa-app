import { Platform } from "react-native";
import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
  type PurchasesOfferings,
} from "react-native-purchases";

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
const ENTITLEMENT_ID = "premium";

// ─────────────────────────────────────────────────────────────────────────────

export function configurePurchases(): void {
  if (Platform.OS !== "ios") return;
  if (!API_KEY) {
    if (__DEV__) {
      console.warn(
        "[RevenueCat] EXPO_PUBLIC_REVENUECAT_IOS_API_KEY is not set. " +
          "Purchases will be unavailable until the key is configured."
      );
    }
    return;
  }
  try {
    Purchases.configure({ apiKey: API_KEY });
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] configure() failed:", e);
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function isPremiumActive(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export type PurchaseResult =
  | { success: true; customerInfo: CustomerInfo }
  | { success: false; userCancelled: true }
  | { success: false; userCancelled: false; error: string };

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<PurchaseResult> {
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo: result.customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return { success: false, userCancelled: true };
    }
    return {
      success: false,
      userCancelled: false,
      error: err.message ?? "Purchase failed",
    };
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
}
