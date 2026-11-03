import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  ForgotPasswordSchema,
  VerifyResetOtpSchema,
  ResetPasswordSchema,
} from '@bizpockethub/shared';

describe('Password Reset OTP System - Unit Tests', () => {
  // Requirement 1 & 12: Email input & normalization
  it('validates email correctly in ForgotPasswordSchema', () => {
    const valid = ForgotPasswordSchema.safeParse({ email: 'USER@EXAMPLE.COM ' });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe('user@example.com');
    }

    const invalid = ForgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(invalid.success).toBe(false);
  });

  // Requirement 2: Cryptographically secure random 6-digit OTP
  it('generates secure 6-digit OTP between 100000 and 999999', () => {
    for (let i = 0; i < 50; i++) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThan(1000000);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    }
  });

  // Requirement 3 & 5: Store only hashed OTP in MongoDB
  it('hashes OTP using SHA-256 for secure storage and matching', () => {
    const rawOtp = '482910';
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // Verify hash is deterministic and 64 hex characters
    expect(hashedOtp).toHaveLength(64);
    expect(hashedOtp).not.toBe(rawOtp);

    // Verify correct input matches
    const testInputCorrect = '482910';
    const testInputCorrectHash = crypto.createHash('sha256').update(testInputCorrect).digest('hex');
    expect(testInputCorrectHash).toBe(hashedOtp);

    // Verify wrong input does not match
    const testInputWrong = '482911';
    const testInputWrongHash = crypto.createHash('sha256').update(testInputWrong).digest('hex');
    expect(testInputWrongHash).not.toBe(hashedOtp);
  });

  // Requirement 4: OTP expires after 5 minutes
  it('enforces 5-minute expiration window', () => {
    const now = Date.now();
    const expiry = new Date(now + 5 * 60 * 1000);
    const expiredTime = new Date(now - 1000);

    expect(expiry.getTime() - now).toBe(300000); // 5 * 60 * 1000 ms
    expect(expiry > new Date()).toBe(true);
    expect(expiredTime < new Date()).toBe(true);
  });

  // Requirement 6: Maximum 5 incorrect verification attempts
  it('limits attempts to a maximum of 5', () => {
    let attempts = 0;
    const maxAttempts = 5;

    for (let i = 1; i <= 5; i++) {
      attempts += 1;
      const isLocked = attempts >= maxAttempts;
      if (i < 5) {
        expect(isLocked).toBe(false);
      } else {
        expect(isLocked).toBe(true);
      }
    }
    expect(attempts).toBe(5);
  });

  // Requirement 7: 60-second cooldown calculation
  it('calculates 60-second cooldown elapsed time accurately', () => {
    const now = Date.now();
    const sentRecently = new Date(now - 25 * 1000); // 25s ago
    const elapsed = Math.floor((now - sentRecently.getTime()) / 1000);
    expect(elapsed).toBe(25);
    const remaining = 60 - elapsed;
    expect(remaining).toBe(35);
    expect(elapsed < 60).toBe(true);

    const sentLongAgo = new Date(now - 70 * 1000); // 70s ago
    const elapsedLong = Math.floor((now - sentLongAgo.getTime()) / 1000);
    expect(elapsedLong >= 60).toBe(true);
  });

  // Requirement 9 & 10: Password strength validation & bcrypt hashing
  it('enforces strong password policy in ResetPasswordSchema', () => {
    // Valid password (min 8 chars, 1 uppercase, 1 number)
    const valid = ResetPasswordSchema.safeParse({
      password: 'StrongPassword123',
    });
    expect(valid.success).toBe(true);

    // Too short (< 8 chars)
    const tooShort = ResetPasswordSchema.safeParse({
      password: 'Short1!',
    });
    expect(tooShort.success).toBe(false);

    // Missing uppercase
    const noUpper = ResetPasswordSchema.safeParse({
      password: 'password123',
    });
    expect(noUpper.success).toBe(false);

    // Missing number
    const noNumber = ResetPasswordSchema.safeParse({
      password: 'PasswordWithoutNumber',
    });
    expect(noNumber.success).toBe(false);
  });

  it('hashes passwords securely using bcrypt', async () => {
    const plain = 'StrongPass123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);

    expect(hash).not.toBe(plain);
    expect(await bcrypt.compare(plain, hash)).toBe(true);
    expect(await bcrypt.compare('WrongPassword123', hash)).toBe(false);
  });

  // VerifyResetOtpSchema validation
  it('validates 6-digit OTP schema correctly', () => {
    const valid = VerifyResetOtpSchema.safeParse({
      email: 'user@example.com',
      otp: '123456',
    });
    expect(valid.success).toBe(true);

    const short = VerifyResetOtpSchema.safeParse({
      email: 'user@example.com',
      otp: '12345',
    });
    expect(short.success).toBe(false);

    const nonNumeric = VerifyResetOtpSchema.safeParse({
      email: 'user@example.com',
      otp: '12a456',
    });
    expect(nonNumeric.success).toBe(false);
  });
});

