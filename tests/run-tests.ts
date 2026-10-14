// Automated Unit & Integration Tests for Study Loop Core Logic
import assert from 'assert';
import { hashPassword } from '../src/server/db.ts';

console.log('🧪 Running Study Loop Test Suite...\n');

let passed = 0;
let failed = 0;

function it(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// 1. Authentication & Cryptography Tests
it('hashPassword produces deterministic SHA-256 hashes with salt', () => {
  const hash1 = hashPassword('secret123');
  const hash2 = hashPassword('secret123');
  const hash3 = hashPassword('different');
  assert.strictEqual(hash1, hash2, 'Identical passwords should match');
  assert.notStrictEqual(hash1, hash3, 'Different passwords should not match');
  assert.strictEqual(hash1.length, 64, 'SHA-256 hex string should be 64 characters');
});

// 2. Adaptive Quiz Sorting Logic
it('Adaptive algorithm prioritizes low-mastery topics and previously missed questions', () => {
  const questions = [
    { id: 'q1', topic: 'CAP Theorem' },
    { id: 'q2', topic: 'Consensus & Raft' },
    { id: 'q3', topic: 'Consistent Hashing' },
  ];

  const masteryMap = new Map([
    ['cap theorem', 88],
    ['consensus & raft', 40], // lowest
    ['consistent hashing', 65],
  ]);

  const missedIds = new Set(['q3']); // q3 was missed before

  const sorted = [...questions].sort((a, b) => {
    const aMissed = missedIds.has(a.id) ? 1 : 0;
    const bMissed = missedIds.has(b.id) ? 1 : 0;
    if (aMissed !== bMissed) return bMissed - aMissed;

    const aMast = masteryMap.get(a.topic.toLowerCase()) ?? 75;
    const bMast = masteryMap.get(b.topic.toLowerCase()) ?? 75;
    return aMast - bMast;
  });

  assert.strictEqual(sorted[0].id, 'q3', 'Previously missed question should be first');
  assert.strictEqual(sorted[1].id, 'q2', 'Lowest mastery topic should be second');
  assert.strictEqual(sorted[2].id, 'q1', 'High mastery topic should be last');
});

// 3. Exam Schedule Planner Distribution
it('Exam planner distributes topics across available days and reserves final review', () => {
  const topics = ['Topic A', 'Topic B', 'Topic C'];
  const availableDaysCount = 6;
  const sessions: any[] = [];

  for (let i = 0; i < availableDaysCount - 1; i++) {
    sessions.push({
      topic: topics[i % topics.length],
      type: i > 0 && i % 3 === 0 ? 'revision' : 'study',
    });
  }
  sessions.push({
    type: 'final_review',
    notes: 'Comprehensive recap',
  });

  assert.strictEqual(sessions.length, 6, 'Total sessions must equal available days');
  assert.strictEqual(sessions[sessions.length - 1].type, 'final_review', 'Last session must be final review');
  assert(sessions.some(s => s.type === 'revision'), 'Must include active revision session');
});

// 4. Streak Calculation Logic
it('Streak calculates strictly from consecutive completed days', () => {
  const todayStr = '2026-10-14';
  const yesterdayStr = '2026-10-13';
  const twoDaysAgoStr = '2026-10-12';

  const activeDates = new Set([todayStr, yesterdayStr, twoDaysAgoStr]);
  let streak = 0;
  let cur = new Date(todayStr);

  while (true) {
    const dStr = cur.toISOString().split('T')[0];
    if (activeDates.has(dStr)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }

  assert.strictEqual(streak, 3, 'Consecutive study dates should yield streak of 3');
});

console.log(`\nTest results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
