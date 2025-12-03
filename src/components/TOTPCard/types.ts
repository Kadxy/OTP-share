export const ALLOWED_DIGITS = [6, 8] as const;
export const ALLOWED_PERIODS = [15, 30, 60] as const;
export const ALLOWED_ALGOS = ['SHA1', 'SHA256', 'SHA512'] as const;

export type Digits = typeof ALLOWED_DIGITS[number];
export type Period = typeof ALLOWED_PERIODS[number];
export type Algorithm = typeof ALLOWED_ALGOS[number];

export interface TOTPParams {
    digits: Digits;
    period: Period;
    algorithm: Algorithm;
}