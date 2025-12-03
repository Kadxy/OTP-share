// src/app/api/share/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma-client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
}).$extends(withAccelerate());

// 解决 BigInt 序列化问题 (JSON.stringify 默认不支持 BigInt)
// @ts-expect-error - Extending BigInt prototype
BigInt.prototype.toJSON = function () { return Number(this) }

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ params 是 Promise
) {
    const { id } = await params;

    try {
        // 1. 查找记录
        const link = await prisma.secureLink.findUnique({
            where: { id },
        });

        // 2. 失效判断
        if (!link) {
            return NextResponse.json({
                error: 'Link not found',
                errorType: 'not_found'
            }, { status: 404 });
        }

        // 已过期
        if (new Date() > link.expiresAt) {
            return NextResponse.json({
                error: 'Link expired',
                errorType: 'expired'
            }, { status: 410 });
        }

        // Burn After Reading 逻辑检查
        if (link.burnAfterReading) {
            // 检查是否已经访问过
            if (link.accessCount > 0) {
                return NextResponse.json({
                    error: 'This link has already been burned.',
                    errorType: 'burned'
                }, { status: 410 });
            }

            // 检查是否在创建后 5 分钟内
            const now = new Date();
            const createdAt = link.createdAt;
            const fiveMinutesInMs = 5 * 60 * 1000;
            const timeSinceCreation = now.getTime() - createdAt.getTime();

            if (timeSinceCreation > fiveMinutesInMs) {
                return NextResponse.json({
                    error: 'Burn-after-reading link expired (5 min limit).',
                    errorType: 'burned'
                }, { status: 410 });
            }
        }

        // 3. 核心计算：基于当前时间计算应该返回哪些codes
        const now = Math.floor(Date.now() / 1000);
        const storedFirstCodeTime = Number(link.firstCodeTimestamp);
        const period = link.period;

        // 计算当前时间对应的period边界（向下对齐）
        const currentPeriodStart = Math.floor(now / period) * period;

        // 计算当前period相对于存储的第一个code的索引
        const elapsedSeconds = currentPeriodStart - storedFirstCodeTime;
        const currentIndex = Math.floor(elapsedSeconds / period);

        const allCodes = JSON.parse(link.codes) as string[];

        // 确保index不为负，也不越界
        if (currentIndex < 0 || currentIndex >= allCodes.length) {
            return NextResponse.json({
                error: 'Time out of sync range',
                errorType: 'expired'
            }, { status: 400 });
        }

        // 根据类型决定返回多少codes
        let codesToReturn: string[];
        let returnedFirstCodeTimestamp: number;

        if (link.burnAfterReading) {
            // 一次性链接：返回从当前period开始的10个codes（5分钟）
            const codesNeeded = Math.ceil(300 / period); // 5分钟 / period
            codesToReturn = allCodes.slice(currentIndex, currentIndex + codesNeeded);
            returnedFirstCodeTimestamp = currentPeriodStart;
        } else {
            // 多次访问：返回所有剩余有效的codes
            codesToReturn = allCodes.slice(currentIndex);
            returnedFirstCodeTimestamp = currentPeriodStart;
        }

        // 5. 更新访问计数
        await prisma.secureLink.update({
            where: { id },
            data: {
                accessCount: { increment: 1 }
            },
        });

        // 6. 返回数据
        return NextResponse.json({
            codes: codesToReturn,
            period: link.period,
            firstCodeTimestamp: returnedFirstCodeTimestamp, // 关键：返回的是数组第一个code的实际时间戳
            burnAfterReading: link.burnAfterReading,
            expiresAt: link.expiresAt.toISOString(),
        });

    } catch (error) {
        console.error('Get link error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}