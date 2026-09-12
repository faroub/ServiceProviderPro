import AsyncStorage from "@react-native-async-storage/async-storage";

const FAV_KEY = "kp_favorite_providers";

export async function getFavoriteProviderIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteProviderId(id: string): Promise<string[]> {
  try {
    const current = await getFavoriteProviderIds();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function isFavoriteProvider(id: string): Promise<boolean> {
  const list = await getFavoriteProviderIds();
  return list.includes(id);
}
