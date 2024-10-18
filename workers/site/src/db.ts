import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

export default function createClient(DB:D1Database):PrismaClient{
    const adapter = new PrismaD1(DB)
    const prisma = new PrismaClient({ adapter })

    return prisma;
}
