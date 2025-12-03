// src/app/api/share/route.ts
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { PrismaClient } from '../../generated/prisma-client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
}).$extends(withAccelerate());

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { codes, period, startTime, expiresIn, burnAfterReading } = body;

        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return NextResponse.json({ error: 'Invalid codes' }, { status: 400 });
        }

        const now = new Date();
        const expiresAt = new Date(now);

        switch (expiresIn) {
            case '1h': expiresAt.setHours(now.getHours() + 1); break;
            case '12h': expiresAt.setHours(now.getHours() + 12); break;
            case '3d': expiresAt.setDate(now.getDate() + 3); break;
            case '24h':
            default:
                expiresAt.setHours(now.getHours() + 24);
        }

        const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7);
        const id = nanoid();

        const link = await prisma.secureLink.create({
            data: {
                id,
                codes: JSON.stringify(codes),
                period: period || 30,
                startTime: BigInt(startTime),
                firstCodeTimestamp: BigInt(startTime),
                burnAfterReading: burnAfterReading ?? true,
                expiresAt: expiresAt,
            },
        });

        return NextResponse.json({ id: link.id });

    } catch (error) {
        console.error('Create link error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}