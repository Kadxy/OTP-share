import { createHmac } from 'crypto';
import { Algorithm } from './types';

function base32Decode(input: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';

    for (const char of input.toUpperCase()) {
        if (char === '=') break;
        const val = base32Chars.indexOf(char);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }

    return Buffer.from(bytes);
}

function generateHOTP(secret: Buffer, counter: number, digits: number, algorithm: string): string {
    const buffer = new Uint8Array(8);
    let tmpCounter = counter;
    for (let i = 7; i >= 0; i--) {
        buffer[i] = tmpCounter & 0xff;
        tmpCounter = Math.floor(tmpCounter / 256);
    }

    const hmac = createHmac(algorithm.toLowerCase(), secret);
    hmac.update(Buffer.from(buffer));
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
    ) % Math.pow(10, digits);

    return code.toString().padStart(digits, '0');
}

export function calculateCodes(
    secret: string,
    period: number,
    digits: number,
    algorithm: Algorithm,
    durationHours: number,
    startTimestamp: number
): string[] {
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    const secretBytes = base32Decode(cleanSecret);
    const count = Math.ceil((durationHours * 3600) / period);
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
        const timestamp = startTimestamp + i * period;
        const counter = Math.floor(timestamp / period);

        try {
            const code = generateHOTP(secretBytes, counter, digits, algorithm);
            codes.push(code);
        } catch (e) {
            console.error("Code gen error at index", i, "counter", counter, "error:", e);
        }
    }

    return codes;
}