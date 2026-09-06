import { randomInt } from 'node:crypto';

/**
 * Código de referência manual para o campo “conceito/complemento” do pagamento.
 * Não é senha, meio de pagamento, comprovante nem liberação automática de acesso.
 */
export const PAYMENT_REFERENCE_LENGTH = 8;

export function generatePaymentReference(nextDigit: () => number = () => randomInt(10)) {
  // O primeiro dígito não é zero para preservar visualmente os oito números
  // quando o aluno o copia para o complemento da transferência.
  const firstDigit = 1 + (nextDigit() % 9);
  const remainingDigits = Array.from({ length: PAYMENT_REFERENCE_LENGTH - 1 }, () => nextDigit() % 10).join('');
  return `${firstDigit}${remainingDigits}`;
}
