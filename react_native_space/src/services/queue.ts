// Offline queue for VleisKraft™ — order capture, cart, stockvel contributions
// Uses AsyncStorage + NetInfo auto-flush on reconnect
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { api } from "./api";

const Q_KEY = "@vleiskraft:queue";

export type QueuedRequest = {
  id: string;
  url: string;
  method: "POST" | "PUT" | "PATCH";
  body: any;
  createdAt: number;
};

async function read(): Promise<QueuedRequest[]> {
  try {
    const r = await AsyncStorage.getItem(Q_KEY);
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

async function write(q: QueuedRequest[]) {
  try { await AsyncStorage.setItem(Q_KEY, JSON.stringify(q)); } catch {}
}

export async function enqueue(url: string, body: any, method: QueuedRequest["method"] = "POST") {
  const list = await read();
  list.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url, body, method,
    createdAt: Date.now(),
  });
  await write(list);
}

export async function queuedCount(): Promise<number> {
  return (await read()).length;
}

export async function flush(): Promise<{ success: number; failed: number }> {
  const list = await read();
  if (!list?.length) return { success: 0, failed: 0 };
  let success = 0; let failed = 0;
  const remaining: QueuedRequest[] = [];
  for (const item of list) {
    try {
      if (item.method === "POST") await api.post(item.url, item.body);
      else if (item.method === "PUT") await api.put(item.url, item.body);
      else if (item.method === "PATCH") await api.patch(item.url, item.body);
      success++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }
  await write(remaining);
  return { success, failed };
}

let started = false;
export function startAutoFlush() {
  if (started) return;
  started = true;
  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      flush().catch(() => {});
    }
  });
}
