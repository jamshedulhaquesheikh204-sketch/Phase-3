const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const getHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: "Bearer " + token } : {}),
});

export const api = {
  async signup(email: string, password: string) {
    const res = await fetch(API_URL + "/auth/signup", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async signin(email: string, password: string) {
    const res = await fetch(API_URL + "/auth/signin", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getTasks(token: string) {
    const res = await fetch(API_URL + "/tasks/", {
      headers: getHeaders(token),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async createTask(token: string, title: string, description?: string) {
    const res = await fetch(API_URL + "/tasks/", {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async updateTask(token: string, id: number, data: any) {
    const res = await fetch(API_URL + "/tasks/" + id, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async deleteTask(token: string, id: number) {
    const res = await fetch(API_URL + "/tasks/" + id, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    if (!res.ok) throw await res.json();
  },

  // Chat API - Phase 4
  async sendChatMessage(token: string, userId: number, message: string, conversationId?: number) {
    const res = await fetch(`${API_URL}/${userId}/chat`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Chat request failed");
    }
    return res.json();
  },

  async getConversations(token: string, userId: number) {
    const res = await fetch(`${API_URL}/${userId}/conversations`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getConversationMessages(token: string, userId: number, conversationId: number) {
    const res = await fetch(`${API_URL}/${userId}/conversations/${conversationId}/messages`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
