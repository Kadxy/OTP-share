"use client";

import React, { useState, useEffect } from 'react';
import { useTOTP } from '@/hooks/useTOTP';
import { TOTPParams, ALLOWED_ALGOS, ALLOWED_DIGITS, ALLOWED_PERIODS, Algorithm, Digits, Period } from './types';
import { InputSection } from './InputSection';
import { TokenDisplay } from './TokenDisplay';
import { ActionBar, PanelType } from './ActionBar';
import { Overlay } from './panels/Overlay';
import { SharePanel } from './panels/SharePanel';
import { QRPanel } from './panels/QRPanel';
import { SettingsPanel } from './panels/SettingsPanel';

export default function TOTPCard() {
    const [secret, setSecret] = useState('');
    const [activePanel, setActivePanel] = useState<PanelType>('none');
    const [params, setParams] = useState<TOTPParams>({ period: 30, digits: 6, algorithm: 'SHA1' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const urlSecret = searchParams.get('secret');

            if (urlSecret) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSecret(urlSecret.trim());

                const algo = searchParams.get('algorithm')?.toUpperCase();
                const dig = parseInt(searchParams.get('digits') || '6');
                const per = parseInt(searchParams.get('period') || '30');

                setParams({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    algorithm: ALLOWED_ALGOS.includes(algo as any) ? (algo as Algorithm) : 'SHA1',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    digits: ALLOWED_DIGITS.includes(dig as any) ? (dig as Digits) : 6,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    period: ALLOWED_PERIODS.includes(per as any) ? (per as Period) : 30,
                });
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);

            if (secret) {
                url.searchParams.set('secret', secret.replace(/\s/g, ''));

                if (params.algorithm !== 'SHA1') {
                    url.searchParams.set('algorithm', params.algorithm);
                } else {
                    url.searchParams.delete('algorithm');
                }

                if (params.digits !== 6) {
                    url.searchParams.set('digits', params.digits.toString());
                } else {
                    url.searchParams.delete('digits');
                }

                if (params.period !== 30) {
                    url.searchParams.set('period', params.period.toString());
                } else {
                    url.searchParams.delete('period');
                }
            } else {
                url.searchParams.delete('secret');
                url.searchParams.delete('algorithm');
                url.searchParams.delete('digits');
                url.searchParams.delete('period');
            }

            window.history.replaceState(null, '', url.toString());
        }
    }, [secret, params]);

    const { token, timeLeft, progress, isValid } = useTOTP(secret, params);

    const isDirty = secret.length > 0 && !/^[A-Z2-7\s]+$/i.test(secret);
    const isError = secret.length > 0 && (isDirty || (!isValid && secret.length >= 8));

    const otpURI = `otpauth://totp/OTPShare?secret=${secret.replace(/\s/g, '')}&issuer=OTPShare&algorithm=${params.algorithm}&digits=${params.digits}&period=${params.period}`;

    return (
        <div className="relative w-full max-w-md perspective-1000">
            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden transition-all duration-300 isolate">

                <InputSection secret={secret} setSecret={setSecret} isError={isError} />

                <TokenDisplay
                    token={token}
                    progress={progress}
                    timeLeft={timeLeft}
                    isValid={isValid}
                />

                {isValid && (
                    <ActionBar activePanel={activePanel} onToggle={setActivePanel} />
                )}

                <Overlay isOpen={activePanel !== 'none'} onClose={() => setActivePanel('none')}>
                    {activePanel === 'qr' && (
                        <QRPanel uri={otpURI} />
                    )}

                    {activePanel === 'settings' && (
                        <SettingsPanel params={params} setParams={setParams} />
                    )}

                    {activePanel === 'share' && (
                        <SharePanel secret={secret} params={params} />
                    )}
                </Overlay>

            </div>
        </div>
    );
}