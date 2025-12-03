import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma-client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
}).$extends(withAccelerate());

// @ts-expect-error - Extending BigInt prototype for JSON serialization
BigInt.prototype.toJSON = function () { return Number(this) }

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const link = await prisma.secureLink.update({
            where: { id },
            data: {
                accessCount: { increment: 1 }
            },
        });

        if (new Date() > link.expiresAt) {
            return NextResponse.json({
                error: 'Link expired',
                errorType: 'expired'
            }, { status: 410 });
        }

        if (link.burnAfterReading && link.accessCount > 1) {
            return NextResponse.json({
                error: 'This link has already been burned.',
                errorType: 'burned'
            }, { status: 410 });
        }

        const now = Math.floor(Date.now() / 1000);
        const storedFirstCodeTime = Number(link.firstCodeTimestamp);
        const period = link.period;

        const currentPeriodStart = Math.floor(now / period) * period;

        const elapsedSeconds = currentPeriodStart - storedFirstCodeTime;
        const currentIndex = Math.floor(elapsedSeconds / period);

        const allCodes = JSON.parse(link.codes) as string[];

        if (currentIndex < 0 || currentIndex >= allCodes.length) {
            return NextResponse.json({
                error: 'Time out of sync range',
                errorType: 'expired'
            }, { status: 400 });
        }

        let codesToReturn: string[];
        let returnedFirstCodeTimestamp: number;

        if (link.burnAfterReading) {
            const codesNeeded = Math.ceil(180 / period);
            codesToReturn = allCodes.slice(currentIndex, currentIndex + codesNeeded);
            returnedFirstCodeTimestamp = currentPeriodStart;
        } else {
            codesToReturn = allCodes.slice(currentIndex);
            returnedFirstCodeTimestamp = currentPeriodStart;
        }

        return NextResponse.json({
            codes: codesToReturn,
            period: link.period,
            firstCodeTimestamp: returnedFirstCodeTimestamp,
            burnAfterReading: link.burnAfterReading,
            expiresAt: link.expiresAt.toISOString(),
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({
                error: 'Link not found',
                errorType: 'not_found'
            }, { status: 404 });
        }

        console.error('Get link error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}