import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Plans
    const plans = await Promise.all([
        prisma.plan.upsert({
            where: { name: 'free' },
            update: {},
            create: {
                name: 'free',
                displayName: 'Free Trial',
                description: 'Try NexLevel Speech with limited credits',
                monthlyPricePKR: 0,
                yearlyPricePKR: 0,
                creditsPerMonth: 5000,
                maxVoiceClones: 1,
                features: JSON.stringify([
                    '5,000 characters per month',
                    '1 voice clone',
                    'MP3 download',
                    'Email support',
                ]),
                isFree: true,
                isActive: true,
            },
        }),
        prisma.plan.upsert({
            where: { name: 'starter' },
            update: {},
            create: {
                name: 'starter',
                displayName: 'Starter',
                description: 'Perfect for individuals and small projects',
                monthlyPricePKR: 1500,
                yearlyPricePKR: 15000,
                creditsPerMonth: 50000,
                maxVoiceClones: 3,
                features: JSON.stringify([
                    '50,000 characters per month',
                    '3 voice clones',
                    'MP3 & WAV download',
                    'Multilingual support',
                    'Email support',
                ]),
                isFree: false,
                isActive: true,
            },
        }),
        prisma.plan.upsert({
            where: { name: 'creator' },
            update: {},
            create: {
                name: 'creator',
                displayName: 'Creator',
                description: 'Ideal for content creators and small teams',
                monthlyPricePKR: 3500,
                yearlyPricePKR: 35000,
                creditsPerMonth: 200000,
                maxVoiceClones: 10,
                features: JSON.stringify([
                    '200,000 characters per month',
                    '10 voice clones',
                    'All audio formats',
                    'Multilingual support',
                    'Priority support',
                    'API access',
                ]),
                isFree: false,
                isActive: true,
            },
        }),
        prisma.plan.upsert({
            where: { name: 'pro' },
            update: {},
            create: {
                name: 'pro',
                displayName: 'Professional',
                description: 'For businesses and high-volume users',
                monthlyPricePKR: 8000,
                yearlyPricePKR: 80000,
                creditsPerMonth: 500000,
                maxVoiceClones: -1, // Unlimited
                features: JSON.stringify([
                    '500,000 characters per month',
                    'Unlimited voice clones',
                    'All audio formats',
                    'Multilingual support',
                    'Dedicated support',
                    'API access',
                    'Commercial license',
                    'Priority processing',
                ]),
                isFree: false,
                isActive: true,
            },
        }),
    ]);

    console.log(`✅ Created ${plans.length} plans`);

    // Create Test User
    const hashedPassword = await bcrypt.hash('Test123456', 12);
    
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: hashedPassword,
            name: 'Test User',
            isActive: true,
            subscription: {
                create: {
                    planId: plans[0].id, // Free plan
                    status: 'TRIAL',
                    billingCycle: 'MONTHLY',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            },
            credits: {
                create: {
                    totalCredits: plans[0].creditsPerMonth,
                    usedCredits: 0,
                    bonusCredits: 0,
                    nextResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            },
        },
        include: {
            subscription: true,
            credits: true,
        },
    });

    console.log(`✅ Created test user: ${testUser.email}`);

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
