import { describe, expect, it } from 'vitest';
import { generatePaymentReference, PAYMENT_REFERENCE_LENGTH } from './paymentReferences';

describe('payment references', () => {
  it('generates an eight-digit numeric reference that does not begin with zero', () => {
    const reference = generatePaymentReference(() => 0);
    expect(reference).toHaveLength(PAYMENT_REFERENCE_LENGTH);
    expect(reference).toMatch(/^[1-9][0-9]{7}$/);
  });

  it('uses the supplied random digits after the first digit', () => {
    const digits = [8, 7, 6, 5, 4, 3, 2, 1];
    let index = 0;
    const reference = generatePaymentReference(() => digits[index++]!);
    expect(reference).toBe('97654321');
  });
});
