// src/app/api/share/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma-client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
}).$extends(withAccelerate());

// 解决 BigInt 序列化问题
// @ts-expect-error - Extending BigInt prototype
BigInt.prototype.toJSON = function () { return Number(this) }

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 🚀 优化：Atomic Update (先更新，后检查)
        // 直接尝试更新访问计数，利用数据库原子性防止并发问题，同时减少一次读取 IO
        // 如果 id 不存在，Prisma 会抛出 P2025 错误，我们在 catch 中处理
        const link = await prisma.secureLink.update({
            where: { id },
            data: {
                accessCount: { increment: 1 }
            },
        });

        // -------------------------------------------------------
        // 1. 失效判断 (Expired)
        // 即使刚才 increment 了，如果已经过期，我们依然视为无效请求返回 410
        // -------------------------------------------------------
        if (new Date() > link.expiresAt) {
            return NextResponse.json({
                error: 'Link expired',
                errorType: 'expired'
            }, { status: 410 });
        }

        // -------------------------------------------------------
        // 2. 阅后即焚逻辑 (Burn After Reading)
        // 逻辑修正：只要在 expiresAt 有效期内，任何时间打开都可以。
        // 检查：如果开启了阅后即焚，且更新后的 accessCount > 1，说明之前已经被访问过了。
        // (注：因为刚才已经 +1，所以 1 代表这是第一次访问，>1 代表是重复访问)
        // -------------------------------------------------------
        if (link.burnAfterReading && link.accessCount > 1) {
            return NextResponse.json({
                error: 'This link has already been burned.',
                errorType: 'burned'
            }, { status: 410 });
        }

        // 3. 核心计算
        const now = Math.floor(Date.now() / 1000);
        const storedFirstCodeTime = Number(link.firstCodeTimestamp);
        const period = link.period;

        // 计算当前时间对应的 period 边界
        const currentPeriodStart = Math.floor(now / period) * period;

        // 计算当前 period 相对于存储的第一个 code 的索引
        const elapsedSeconds = currentPeriodStart - storedFirstCodeTime;
        const currentIndex = Math.floor(elapsedSeconds / period);

        const allCodes = JSON.parse(link.codes) as string[];

        // 确保 index 不越界 (负数检查，正向越界由 slice 自动处理)
        if (currentIndex < 0 || currentIndex >= allCodes.length) {
            return NextResponse.json({
                error: 'Time out of sync range',
                errorType: 'expired'
            }, { status: 400 });
        }

        let codesToReturn: string[];
        let returnedFirstCodeTimestamp: number;

        if (link.burnAfterReading) {
            // 阅后即焚：返回未来 3 分钟 (180s) 的 codes
            // slice 特性：如果 currentIndex + codesNeeded 超过数组长度，只会返回剩下的所有元素，不会报错。
            const codesNeeded = Math.ceil(180 / period);
            codesToReturn = allCodes.slice(currentIndex, currentIndex + codesNeeded);
            returnedFirstCodeTimestamp = currentPeriodStart;
        } else {
            // 普通模式：返回所有剩余 codes
            codesToReturn = allCodes.slice(currentIndex);
            returnedFirstCodeTimestamp = currentPeriodStart;
        }

        // 4. 返回数据
        return NextResponse.json({
            codes: codesToReturn,
            period: link.period,
            firstCodeTimestamp: returnedFirstCodeTimestamp,
            burnAfterReading: link.burnAfterReading,
            expiresAt: link.expiresAt.toISOString(),
        });

    } catch (error: any) {
        // Prisma Record Not Found Error (P2025)
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