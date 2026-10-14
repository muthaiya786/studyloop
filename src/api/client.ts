// API client for Study Loop REST API v1

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: `HTTP ${response.status}: Unexpected response format`,
  }));

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    signup: (data: { email: string; password: string; name: string; timezone?: string }) =>
      request<{ success: boolean; user: any }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ success: boolean; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      }),
    me: () =>
      request<{ success: boolean; user: any }>('/auth/me'),
    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string; demoToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (data: { token: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Dashboard
  dashboard: {
    get: () =>
      request<{ success: boolean; data: any }>('/dashboard'),
  },

  // Exams & Planner
  exams: {
    getAll: () =>
      request<{ success: boolean; exams: any[] }>('/exams'),
    getById: (examId: string) =>
      request<{ success: boolean; exam: any }>(`/exams/${examId}`),
    create: (examData: any) =>
      request<{ success: boolean; exam: any }>('/exams', {
        method: 'POST',
        body: JSON.stringify(examData),
      }),
    update: (examId: string, updates: any) =>
      request<{ success: boolean; exam: any }>(`/exams/${examId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    delete: (examId: string) =>
      request<{ success: boolean; message: string }>(`/exams/${examId}`, {
        method: 'DELETE',
      }),
    generatePlan: (examId: string) =>
      request<{ success: boolean; sessions: any[] }>(`/exams/${examId}/generate-plan`, {
        method: 'POST',
      }),
  },

  // Study Sessions
  sessions: {
    update: (sessionId: string, updates: any) =>
      request<{ success: boolean; session: any }>(`/study-sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    complete: (sessionId: string) =>
      request<{ success: boolean; session: any }>(`/study-sessions/${sessionId}/complete`, {
        method: 'POST',
      }),
  },

  // Notes & Decks
  decks: {
    getAll: () =>
      request<{ success: boolean; decks: any[] }>('/decks'),
    getById: (deckId: string) =>
      request<{
        success: boolean;
        deck: any;
        summary: any;
        flashcards: any[];
        questionsCount: number;
        attemptsCount: number;
        shareLink?: any;
      }>(`/decks/${deckId}`),
    uploadNoteFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<{ success: boolean; document: any }>('/notes/upload', {
        method: 'POST',
        body: formData,
      });
    },
    generate: (payload: { text: string; title?: string; subject?: string; noteDocumentId?: string }) =>
      request<{ success: boolean; data: any }>('/decks/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (deckId: string, updates: any) =>
      request<{ success: boolean; deck: any }>(`/decks/${deckId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    delete: (deckId: string) =>
      request<{ success: boolean; message: string }>(`/decks/${deckId}`, {
        method: 'DELETE',
      }),
    share: (deckId: string) =>
      request<{ success: boolean; shareLink: any }>(`/decks/${deckId}/share`, {
        method: 'POST',
      }),
    revokeShare: (deckId: string) =>
      request<{ success: boolean; revoked: boolean }>(`/decks/${deckId}/share`, {
        method: 'DELETE',
      }),
  },

  // Quiz Practice
  quiz: {
    getQuestions: (deckId: string) =>
      request<{
        success: boolean;
        deck: { id: string; title: string; subject: string };
        questions: Array<{
          id: string;
          prompt: string;
          topic: string;
          difficulty: string;
          options: Array<{ id: string; text: string }>;
        }>;
      }>(`/decks/${deckId}/quiz`),
    submitAttempt: (deckId: string, payload: {
      answers: Array<{ questionId: string; selectedOptionId: string; timeSpentSeconds?: number }>;
      timeSpentSeconds: number;
    }) =>
      request<{
        success: boolean;
        attempt: any;
        feedback: any[];
        updatedMasteries: any[];
      }>(`/decks/${deckId}/attempts`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Flashcards
  flashcards: {
    review: (flashcardId: string, knewIt: boolean) =>
      request<{ success: boolean; review: any }>(`/flashcards/${flashcardId}/review`, {
        method: 'POST',
        body: JSON.stringify({ knewIt }),
      }),
  },

  // Learning Analytics & Weak Topics
  progress: {
    get: () =>
      request<{
        success: boolean;
        overallMastery: number;
        quizAccuracy: number;
        totalQuestionsPracticed: number;
        totalQuizzesTaken: number;
        topicMasteries: any[];
        weakTopics: any[];
        strongTopics: any[];
        recentAttempts: any[];
        missedConcepts: any[];
        streak: { currentStreak: number; longestStreak: number; activeDays: string[] };
      }>('/progress'),
  },

  // Reminders
  reminders: {
    get: () =>
      request<{ success: boolean; reminders: any; streak: any }>('/reminders'),
    update: (updates: any) =>
      request<{ success: boolean; reminders: any }>('/reminders', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },

  // Settings & Account
  settings: {
    update: (data: { name?: string; timezone?: string; settings?: any }) =>
      request<{ success: boolean; user: any; settings: any }>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteAccount: () =>
      request<{ success: boolean; message: string }>('/account', {
        method: 'DELETE',
      }),
  },

  // Public shared deck
  shared: {
    getByToken: (shareToken: string) =>
      request<{
        success: boolean;
        deck: any;
        summary: any;
        flashcards: any[];
        questionsCount: number;
      }>(`/share/${shareToken}`),
  },
};
