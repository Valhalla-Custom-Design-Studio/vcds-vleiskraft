/**
 * Stream.io real-time chat for Stockvel groups
 * API Key: xdpp6ngtjmpz (from VCDS credentials)
 */
import { StreamChat, Channel } from 'stream-chat';

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_KEY || 'xdpp6ngtjmpz';

let chatClient: StreamChat | null = null;

export async function initStreamChat(userId: string, userToken: string, displayName: string): Promise<StreamChat> {
  if (chatClient) return chatClient;
  chatClient = StreamChat.getInstance(STREAM_KEY);
  await chatClient.connectUser({ id: userId, name: displayName }, userToken);
  return chatClient;
}

export async function disconnectStreamChat(): Promise<void> {
  await chatClient?.disconnectUser();
  chatClient = null;
}

export async function getOrCreateStockvelChannel(
  client: StreamChat,
  stockvelId: string,
  stockvelName: string,
  memberIds: string[],
): Promise<Channel> {
  const channel = client.channel('messaging', `stockvel-${stockvelId}`, {
    name: stockvelName,
    members: memberIds,
    stockvel_id: stockvelId,
  });
  await channel.watch();
  return channel;
}

export async function sendStockvelMessage(
  channel: Channel,
  text: string,
  attachments?: { type: string; asset_url: string; title: string }[],
): Promise<void> {
  await channel.sendMessage({ text, attachments });
}

export async function getStreamUserToken(userId: string, apiToken: string): Promise<string> {
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';
  const res = await fetch(`${API_BASE}/api/stream/token`, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  if (!res.ok) throw new Error('Failed to get Stream token');
  const { token } = await res.json();
  return token;
}
