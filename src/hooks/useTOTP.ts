import { useState, useEffect } from 'react';
import { authenticator } from 'otplib';

interface TOTPOptions {
    period: number;
    digits: number;
    algorithm: string;
}

export function useTOTP(secret: string, options: TOTPOptions = { period: 30, digits: 6, algorithm: 'SHA1' }) {
    const [token, setToken] = useState<string>('------');
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [isValid, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const cleanSecret = secret.replace(/\s/g, '').toUpperCase();

        if (!cleanSecret) {
            const resetState = () => {
                setIsValid(false);
                setToken('------');
                setProgress(0);
                setTimeLeft(0);
            };
            resetState();
            return;
        }

        try {
            const GeneratorClass = Object.getPrototypeOf(authenticator).constructor;

            const generator = new GeneratorClass({
                ...authenticator.options,
                step: options.period,
                digits: options.digits,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                algorithm: options.algorithm.toLowerCase() as any
            });

            const update = () => {
                try {
                    const newToken = generator.generate(cleanSecret);
                    setToken(newToken);
                    setIsValid(true);

                    const epoch = Math.floor(Date.now() / 1000);
                    const step = options.period;
                    const remaining = step - (epoch % step);

                    setTimeLeft(remaining);
                    setProgress((remaining / step) * 100);
                } catch {
                    setIsValid(false);
                }
            };

            update();
            const interval = setInterval(update, 100);
            return () => clearInterval(interval);

        } catch (e) {
            console.error("TOTP Init Error:", e);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsValid(false);
        }
    }, [secret, options.period, options.digits, options.algorithm]);

    return { token, timeLeft, progress, isValid };
}