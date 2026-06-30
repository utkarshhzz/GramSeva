// ============================================================
// GramSahay — Firestore Data Layer
// ============================================================
// All CRUD operations for community issues, users, votes,
// comments, and leaderboard queries.
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  CommunityIssue,
  CommunityUser,
  IssueComment,
  IssueVote,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  UserRole,
} from '@/types/community';

// ── Collection names ──────────────────────────────────────────

const COLLECTIONS = {
  USERS:    'users',
  ISSUES:   'issues',
  COMMENTS: 'issue_comments',
  VOTES:    'issue_votes',
} as const;

// ── Helper ────────────────────────────────────────────────────

function toISO(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

// ── User operations ───────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    ward?: string;
  }
): Promise<CommunityUser> {
  const now = new Date().toISOString();
  const profile: Omit<CommunityUser, 'uid'> & { uid: string } = {
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    ward: data.ward || '',
    role: 'citizen' as UserRole,
    points: 0,
    badges: [],
    issuesReported: 0,
    issuesResolved: 0,
    issuesSupported: 0,
    profileImage: '',
    createdAt: now,
    updatedAt: now,
  };

  await import('firebase/firestore').then(({ setDoc }) =>
    setDoc(doc(db, COLLECTIONS.USERS, uid), profile)
  );

  return profile;
}

export async function getUserProfile(uid: string): Promise<CommunityUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as CommunityUser;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<CommunityUser>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ── Issue operations ──────────────────────────────────────────

export async function createIssue(
  data: Omit<CommunityIssue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'commentCount'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, COLLECTIONS.ISSUES), {
    ...data,
    upvotes: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
    acknowledgedAt: null,
    resolvedAt: null,
  });

  // Update user's reported count
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, data.reporterId), {
      issuesReported: increment(1),
      points: increment(10), // 10 points per report
    });
  } catch (e) {
    console.warn('Could not update user stats:', e);
  }

  return docRef.id;
}

export async function getIssue(id: string): Promise<CommunityIssue | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ISSUES, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as CommunityIssue;
}

export async function getIssues(options?: {
  category?: IssueCategory;
  status?: IssueStatus;
  severity?: IssueSeverity;
  ward?: string;
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}): Promise<{ issues: CommunityIssue[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  const constraints: Parameters<typeof query>[1][] = [];

  if (options?.category) constraints.push(where('category', '==', options.category));
  if (options?.status)   constraints.push(where('status', '==', options.status));
  if (options?.severity) constraints.push(where('severity', '==', options.severity));
  if (options?.ward)     constraints.push(where('ward', '==', options.ward));

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(options?.limitCount || 20));

  if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));

  const q = query(collection(db, COLLECTIONS.ISSUES), ...constraints);
  const snap = await getDocs(q);

  const issues = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityIssue));
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { issues, lastDoc };
}

export async function getUserIssues(userId: string): Promise<CommunityIssue[]> {
  const q = query(
    collection(db, COLLECTIONS.ISSUES),
    where('reporterId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityIssue));
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
  resolverUid?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'acknowledged') updates.acknowledgedAt = new Date().toISOString();
  if (status === 'resolved') {
    updates.resolvedAt = new Date().toISOString();
    // Award points to resolver
    if (resolverUid) {
      try {
        await updateDoc(doc(db, COLLECTIONS.USERS, resolverUid), {
          issuesResolved: increment(1),
          points: increment(25),
        });
      } catch (e) {
        console.warn('Could not update resolver stats:', e);
      }
    }
  }

  await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), updates);
}

// ── Vote operations ───────────────────────────────────────────

export async function toggleVote(
  issueId: string,
  userId: string
): Promise<boolean> {
  // Check if user already voted
  const q = query(
    collection(db, COLLECTIONS.VOTES),
    where('issueId', '==', issueId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    // Add vote
    await addDoc(collection(db, COLLECTIONS.VOTES), {
      issueId,
      userId,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
      upvotes: increment(1),
    });
    // Award point for supporting
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        issuesSupported: increment(1),
        points: increment(2),
      });
    } catch (e) { /* ignore */ }
    return true; // voted
  } else {
    // Remove vote
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
      upvotes: increment(-1),
    });
    return false; // un-voted
  }
}

export async function hasUserVoted(issueId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, COLLECTIONS.VOTES),
    where('issueId', '==', issueId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Comment operations ────────────────────────────────────────

export async function addComment(
  data: Omit<IssueComment, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  // Increment comment count on issue
  await updateDoc(doc(db, COLLECTIONS.ISSUES, data.issueId), {
    commentCount: increment(1),
  });

  // Award point for commenting
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, data.userId), {
      points: increment(3),
    });
  } catch (e) { /* ignore */ }

  return docRef.id;
}

export async function getComments(issueId: string): Promise<IssueComment[]> {
  const q = query(
    collection(db, COLLECTIONS.COMMENTS),
    where('issueId', '==', issueId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as IssueComment));
}

// ── Leaderboard ───────────────────────────────────────────────

export async function getLeaderboard(
  topN: number = 20
): Promise<CommunityUser[]> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy('points', 'desc'),
    limit(topN)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as CommunityUser);
}

// ── Image upload (base64 — no paid Storage needed) ───────────

export async function uploadIssueImage(
  file: File,
  _issueId: string,
  _index: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Compress image to max 800px width and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // JPEG at 60% quality keeps it small
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Stats (for dashboard) ────────────────────────────────────

export async function getCommunityStats(): Promise<{
  totalIssues: number;
  resolvedIssues: number;
  activeUsers: number;
  categoryCounts: Record<string, number>;
}> {
  const issuesSnap = await getDocs(collection(db, COLLECTIONS.ISSUES));
  const usersSnap  = await getDocs(collection(db, COLLECTIONS.USERS));

  const issues = issuesSnap.docs.map(d => d.data());
  const resolved = issues.filter(i => i.status === 'resolved').length;

  const categoryCounts: Record<string, number> = {};
  issues.forEach(i => {
    const cat = (i.category as string) || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return {
    totalIssues: issues.length,
    resolvedIssues: resolved,
    activeUsers: usersSnap.size,
    categoryCounts,
  };
}
