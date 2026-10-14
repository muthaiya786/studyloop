import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, hashPassword, generateId } from './src/server/db.ts';
import { generateStudyDeckFromText } from './src/server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'application/octet-stream'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || ['.pdf', '.txt', '.md'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and Markdown files are supported.'));
    }
  },
});

// Auth helper: retrieves current authenticated user from cookie or authorization header
function getCurrentUser(req: Request) {
  const token = req.cookies?.studyloop_session || req.headers?.authorization?.replace('Bearer ', '');
  if (token) {
    const user = db.findUserById(token);
    if (user) return user;
  }
  // Default to demo user if no cookie yet for seamless development preview
  const demo = db.findUserByEmail('alex@studyloop.edu');
  return demo || db.getRawData().users[0];
}

// Auth middleware for protected routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized: Please log in to continue.' });
    return;
  }
  (req as any).user = user;
  next();
}

// ==================== REST API v1 ROUTES ====================

// --- Authentication ---
app.post('/api/v1/auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password, name, timezone } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      return;
    }
    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }
    const user = db.createUser({ email, password, name, timezone });
    res.cookie('studyloop_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Signup failed' });
  }
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }
    const user = db.findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }
    res.cookie('studyloop_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

app.post('/api/v1/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('studyloop_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  const settings = db.getUserSettings(user.id);
  const reminders = db.getReminderPreferences(user.id);
  const streak = db.calculateStreak(user.id);
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      settings,
      reminders,
      streak,
    },
  });
});

app.post('/api/v1/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }
  const user = db.findUserByEmail(email);
  const resetToken = 'reset_' + generateId();
  if (user) {
    db.getRawData().passwordResetTokens.push({
      id: generateId(),
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    });
    db.save();
  }
  res.json({
    success: true,
    message: 'If that email is registered, password recovery instructions and a reset link have been issued.',
    demoToken: user ? resetToken : undefined,
  });
});

app.post('/api/v1/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ success: false, error: 'Token and new password are required' });
    return;
  }
  const reset = db.getRawData().passwordResetTokens.find(t => t.token === token && !t.used);
  if (!reset || new Date(reset.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    return;
  }
  const user = db.findUserById(reset.userId);
  if (user) {
    user.passwordHash = hashPassword(newPassword);
    reset.used = true;
    db.save();
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    return;
  }
  res.status(404).json({ success: false, error: 'User not found' });
});

// --- Dashboard Overview ---
app.get('/api/v1/dashboard', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const exams = db.getExams(user.id);
  const decks = db.getDecks(user.id);
  const streak = db.calculateStreak(user.id);
  const analytics = db.getProgressAnalytics(user.id);

  // Today's scheduled study sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const userExamIds = new Set(exams.map(e => e.id));
  const allSessions = db.getRawData().studySessions.filter(s => userExamIds.has(s.examId));
  const todayTasks = allSessions.filter(s => s.scheduledDate === todayStr);

  // Calculate completed vs pending sessions
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter(s => s.status === 'completed').length;
  const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Calculate weekly study time
  const oneWeekAgo = Date.now() - 7 * 86400000;
  let weeklyStudyMinutes = 0;
  allSessions
    .filter(s => s.status === 'completed' && s.completedAt && new Date(s.completedAt).getTime() > oneWeekAgo)
    .forEach(s => (weeklyStudyMinutes += s.durationMinutes || 45));

  analytics.recentAttempts
    .filter(a => new Date(a.completedAt).getTime() > oneWeekAgo)
    .forEach(a => (weeklyStudyMinutes += Math.round((a.timeSpentSeconds || 60) / 60)));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      stats: {
        weeklyStudyMinutes,
        completionPercentage,
        decksCount: decks.length,
        examsCount: exams.length,
        currentStreak: streak.currentStreak,
        activeDays: streak.activeDays,
        overallMastery: analytics.overallMastery,
      },
      todayTasks,
      upcomingExams: exams.map(e => ({
        id: e.id,
        title: e.title,
        subject: e.subject,
        targetDate: e.targetDate,
        daysLeft: Math.max(0, Math.ceil((new Date(e.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      })),
      weakTopics: analytics.weakTopics.slice(0, 4),
      recentQuizResults: analytics.recentAttempts,
    },
  });
});

// --- Notes & Deck Generation ---
app.post('/api/v1/notes/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file was uploaded.' });
      return;
    }

    const file = req.file;
    let extractedText = '';

    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfModule: any = await import('pdf-parse');
        const pdfParse = pdfModule.default || pdfModule;
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text || '';
        if (extractedText.trim().length === 0) {
          extractedText = `[Notice: Scanned PDF detected] No raw text characters could be extracted. Please paste your lecture text or outline directly into the editor below to continue.`;
        }
      } catch (err: any) {
        console.warn('PDF parse fallback:', err);
        extractedText = `[Notice: OCR Required] Unable to extract pure vector text from ${file.originalname}. Please paste your notes below.`;
      }
    } else {
      extractedText = file.buffer.toString('utf-8');
    }

    const doc = db.saveNoteDocument(user.id, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      extractedText,
    });

    res.json({
      success: true,
      document: doc,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'File upload failed' });
  }
});

app.post('/api/v1/decks/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { text, title, subject, noteDocumentId } = req.body;

    if (!text || text.trim().length < 15) {
      res.status(400).json({ success: false, error: 'Please provide at least 15 characters of notes or syllabus text.' });
      return;
    }

    // Call server-side AI generator with Gemini 3.8 Flash (and automatic demo fallback with clear indicator)
    const generated = await generateStudyDeckFromText(text, title, subject);

    const created = db.createDeckWithContent(user.id, {
      title: generated.title,
      subject: generated.subject,
      description: generated.summary.overview.slice(0, 200) + '...',
      isAiGenerated: generated.isAiGenerated,
      isDemoMode: generated.isDemoMode,
      summary: generated.summary,
      flashcards: generated.flashcards,
      questions: generated.questions,
      noteDocumentId,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    console.error('Error generating study deck:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate study deck.' });
  }
});

app.get('/api/v1/decks', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const decks = db.getDecks(user.id);
  // Add quick summary stats
  const decksWithStats = decks.map(d => {
    const details = db.getDeckDetails(d.id, user.id);
    return {
      ...d,
      flashcardsCount: details?.flashcards.length || 0,
      questionsCount: details?.questionsCount || 0,
      attemptsCount: details?.attemptsCount || 0,
      isShared: !!details?.shareLink,
    };
  });
  res.json({ success: true, decks: decksWithStats });
});

app.get('/api/v1/decks/:deckId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const details = db.getDeckDetails(req.params.deckId, user.id);
  if (!details) {
    res.status(404).json({ success: false, error: 'Study deck not found' });
    return;
  }
  res.json({ success: true, ...details });
});

app.patch('/api/v1/decks/:deckId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deck = db.getRawData().studyDecks.find(d => d.id === req.params.deckId && d.userId === user.id);
  if (!deck) {
    res.status(404).json({ success: false, error: 'Deck not found' });
    return;
  }
  const { title, subject, description } = req.body;
  if (title) deck.title = title.trim();
  if (subject) deck.subject = subject.trim();
  if (description !== undefined) deck.description = description;
  deck.updatedAt = new Date().toISOString();
  db.save();
  res.json({ success: true, deck });
});

app.delete('/api/v1/decks/:deckId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deleted = db.deleteDeck(req.params.deckId, user.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Deck not found or unauthorized' });
    return;
  }
  res.json({ success: true, message: 'Deck deleted successfully.' });
});

// --- Deck Sharing ---
app.post('/api/v1/decks/:deckId/share', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deck = db.getRawData().studyDecks.find(d => d.id === req.params.deckId && d.userId === user.id);
  if (!deck) {
    res.status(404).json({ success: false, error: 'Deck not found' });
    return;
  }
  const shareLink = db.getOrCreateShareLink(deck.id);
  res.json({ success: true, shareLink });
});

app.delete('/api/v1/decks/:deckId/share', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deck = db.getRawData().studyDecks.find(d => d.id === req.params.deckId && d.userId === user.id);
  if (!deck) {
    res.status(404).json({ success: false, error: 'Deck not found' });
    return;
  }
  const revoked = db.revokeShareLink(deck.id);
  res.json({ success: true, revoked });
});

app.get('/api/v1/share/:shareToken', (req: Request, res: Response) => {
  const shared = db.getSharedDeck(req.params.shareToken);
  if (!shared) {
    res.status(404).json({ success: false, error: 'Shared study deck not found or link has expired.' });
    return;
  }
  res.json({ success: true, ...shared });
});

// --- Adaptive Quiz Engine ---
app.get('/api/v1/decks/:deckId/quiz', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deck = db.getRawData().studyDecks.find(d => d.id === req.params.deckId && d.userId === user.id);
  if (!deck) {
    res.status(404).json({ success: false, error: 'Deck not found' });
    return;
  }
  // Adaptive questions without answer reveals
  const questions = db.getAdaptiveQuizQuestions(deck.id, user.id);
  res.json({
    success: true,
    deck: { id: deck.id, title: deck.title, subject: deck.subject },
    questions,
  });
});

app.post('/api/v1/decks/:deckId/attempts', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { answers, timeSpentSeconds } = req.body;
  if (!answers || !Array.isArray(answers)) {
    res.status(400).json({ success: false, error: 'Submitted answers array is required.' });
    return;
  }
  const result = db.submitQuizAttempt(user.id, req.params.deckId, answers, timeSpentSeconds || 60);
  res.status(201).json({
    success: true,
    ...result,
  });
});

// --- Flashcard Review ---
app.post('/api/v1/flashcards/:flashcardId/review', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { knewIt } = req.body;
  const review = db.recordFlashcardReview(user.id, req.params.flashcardId, Boolean(knewIt));
  res.json({ success: true, review });
});

// --- Learning Analytics & Weak Topics ---
app.get('/api/v1/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const analytics = db.getProgressAnalytics(user.id);
  const streak = db.calculateStreak(user.id);
  res.json({ success: true, ...analytics, streak });
});

// --- Exam Planner ---
app.get('/api/v1/exams', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const exams = db.getExams(user.id);
  const fullExams = exams.map(e => db.getExamById(e.id, user.id)!);
  res.json({ success: true, exams: fullExams });
});

app.post('/api/v1/exams', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, subject, targetDate, dailyMinutes, availableDays, topics, notes } = req.body;

    if (!title || !subject || !targetDate) {
      res.status(400).json({ success: false, error: 'Title, subject, and target examination date are required.' });
      return;
    }

    const created = db.createExam(user.id, {
      title,
      subject,
      targetDate,
      dailyMinutes: dailyMinutes ? parseInt(dailyMinutes, 10) : 45,
      availableDays: Array.isArray(availableDays) && availableDays.length > 0 ? availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      topics: Array.isArray(topics) ? topics : [{ name: 'Core Foundations', difficulty: 'medium', weightPercentage: 100 }],
      notes,
    });

    res.status(201).json({ success: true, exam: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create exam plan.' });
  }
});

app.get('/api/v1/exams/:examId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const exam = db.getExamById(req.params.examId, user.id);
  if (!exam) {
    res.status(404).json({ success: false, error: 'Exam plan not found.' });
    return;
  }
  res.json({ success: true, exam });
});

app.patch('/api/v1/exams/:examId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const updated = db.updateExam(req.params.examId, user.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Exam not found.' });
    return;
  }
  res.json({ success: true, exam: updated });
});

app.delete('/api/v1/exams/:examId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const deleted = db.deleteExam(req.params.examId, user.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Exam not found.' });
    return;
  }
  res.json({ success: true, message: 'Exam plan removed.' });
});

app.post('/api/v1/exams/:examId/generate-plan', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const sessions = db.generatePlanForExam(req.params.examId, user.id);
  res.json({ success: true, sessions });
});

// --- Study Sessions ---
app.patch('/api/v1/study-sessions/:sessionId', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateStudySession(req.params.sessionId, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Study session not found.' });
    return;
  }
  res.json({ success: true, session: updated });
});

app.post('/api/v1/study-sessions/:sessionId/complete', requireAuth, (req: Request, res: Response) => {
  const session = db.updateStudySession(req.params.sessionId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
  if (!session) {
    res.status(404).json({ success: false, error: 'Study session not found.' });
    return;
  }
  res.json({ success: true, session });
});

// --- Reminders & Settings ---
app.get('/api/v1/reminders', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const reminders = db.getReminderPreferences(user.id);
  const streak = db.calculateStreak(user.id);
  res.json({ success: true, reminders, streak });
});

app.patch('/api/v1/reminders', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const reminders = db.updateReminderPreferences(user.id, req.body);
  res.json({ success: true, reminders });
});

app.patch('/api/v1/settings', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, timezone, settings } = req.body;
  if (name || timezone) {
    db.updateUser(user.id, { name, timezone });
  }
  if (settings) {
    db.updateUserSettings(user.id, settings);
  }
  const updatedUser = db.findUserById(user.id);
  res.json({ success: true, user: updatedUser, settings: db.getUserSettings(user.id) });
});

app.delete('/api/v1/account', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  db.deleteUser(user.id);
  res.clearCookie('studyloop_session');
  res.json({ success: true, message: 'Account and associated study data permanently deleted.' });
});

// --- Centralized API 404 & Error Handler ---
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ==================== VITE MIDDLEWARE SETUP ====================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Study Loop backend & frontend serving on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
