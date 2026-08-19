import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users, passwordResets } from '../drizzle/schema';
import { getDb } from './db';
import { generatePaymentReference } from './paymentReferences';

const SALT_ROUNDS = 10;
const PASSWORD_RESET_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DEFAULT_ACCESS_DURATION_DAYS = 90;

export function calculateAccessExpiry(days: number, from = new Date()) {
  const expiration = new Date(from);
  expiration.setDate(expiration.getDate() + days);
  return expiration;
}

export function isAccessExpired(user: { isMaster: boolean; accessExpiresAt: Date | null }, now = new Date()) {
  return !user.isMaster && Boolean(user.accessExpiresAt && user.accessExpiresAt.getTime() <= now.getTime());
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user with email and password
 */
async function createUniquePaymentReference() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Eight characters from a 32-symbol alphabet make accidental collisions rare.
  // The unique database index remains the final protection in the unlikely race.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const paymentReference = generatePaymentReference();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.paymentReference, paymentReference)).limit(1);
    if (!existing.length) return paymentReference;
  }
  throw new Error('Não foi possível gerar uma referência de pagamento única. Tente novamente.');
}

/**
 * Register a pending student with a numeric reference for manual statement
 * matching. The reference never proves payment or grants access by itself.
 */
export async function registerUser(email: string, password: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const openId = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const paymentReference = await createUniquePaymentReference();
  await db.insert(users).values({
    openId,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0],
    passwordHash,
    role: 'user',
    isApproved: false,
    isBlocked: false,
    paymentReference,
  });

  return { paymentReference };
}

/**
 * Create an approved account with a temporary password set by an administrator.
 */
export async function createUserByAdmin(email: string, temporaryPassword: string, name?: string, accessDurationDays = DEFAULT_ACCESS_DURATION_DAYS) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(temporaryPassword);
  const openId = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const accessExpiresAt = calculateAccessExpiry(accessDurationDays);

  await db.insert(users).values({
    openId,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0],
    passwordHash,
    role: 'user',
    isApproved: true,
    isBlocked: false,
    mustChangePassword: true,
    isMaster: false,
    accessExpiresAt,
  });

  return { email: normalizedEmail, name: name?.trim() || normalizedEmail.split('@')[0] };
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result[0];

  if (!user.passwordHash) {
    throw new Error('User does not have password authentication enabled');
  }

  if (user.isBlocked) {
    throw new Error('User account is blocked');
  }

  if (!user.isApproved) {
    throw new Error('User account is pending approval');
  }

  if (isAccessExpired(user)) {
    throw new Error('O acesso desta conta venceu. Entre em contato para renovar.');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Ensure openId exists for session creation
  if (!user.openId) {
    const openId = `email_${user.id}_${Date.now()}`;
    await db.update(users).set({ openId, lastSignedIn: new Date() }).where(eq(users.id, user.id));
    user.openId = openId;
  } else {
    // Update last signed in
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  }

  return user;
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await db.insert(passwordResets).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1);
  
  if (result.length === 0) {
    throw new Error('Invalid or expired token');
  }

  const reset = result[0];

  if (new Date() > reset.expiresAt) {
    // Delete expired token
    await db.delete(passwordResets).where(eq(passwordResets.token, token));
    throw new Error('Token has expired');
  }

  return reset;
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const reset = await verifyPasswordResetToken(token);
  const passwordHash = await hashPassword(newPassword);

  await db.update(users).set({ passwordHash, mustChangePassword: false }).where(eq(users.id, reset.userId));
  await db.delete(passwordResets).where(eq(passwordResets.token, token));

  return true;
}

/**
 * Change a signed-in user's password. A current password is required unless the
 * account is still using an administrator-issued temporary password.
 */
export async function changePasswordForUser(userId: number, newPassword: string, currentPassword?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];
  if (!user || !user.passwordHash) {
    throw new Error('User does not have password authentication enabled');
  }

  if (!user.mustChangePassword) {
    if (!currentPassword) {
      throw new Error('Current password is required');
    }
    const currentPasswordIsValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentPasswordIsValid) {
      throw new Error('Current password is incorrect');
    }
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, mustChangePassword: false }).where(eq(users.id, userId));
  return true;
}

/**
 * Define uma nova senha temporária por ação administrativa. A senha anterior
 * nunca é lida nem retornada: somente o novo hash é persistido.
 */
export async function resetPasswordByAdmin(userId: number, temporaryPassword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];
  if (!user) throw new Error('User not found');
  if (user.isMaster) throw new Error('The master account password must be changed from its own session');

  const passwordHash = await hashPassword(temporaryPassword);
  await db.update(users).set({ passwordHash, mustChangePassword: true }).where(eq(users.id, userId));
  return { email: user.email, mustChangePassword: true };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}
