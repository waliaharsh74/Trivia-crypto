'use server'

import { generateSlug } from "random-word-slugs";
import Groq from "groq-sdk";
import { createPublicClient, http, parseEther } from 'viem'
import { mainnet,sepolia } from 'viem/chains'

const client = createPublicClient({
    chain: sepolia, // or sepolia, hardhat, etc.
    transport: http()
})

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const CONTRACT_ADDRESS ='0x4032E8E21e1c09a9E5910F99dA6454FFae530Bcf'
export const getUniqueSlug = async () => {
    const prisma = (await import("@/db")).default;

    let slug = generateSlug();
    while((await prisma.bet.findFirst({where:{slug}})))
    {
        slug = generateSlug();
    }

    return { msg: "Bet Created Successfully!", slug };
};
export async function verifyTransaction(txHash: `0x${string}`, address: `0x${string}`, betAmount: string){
    const receipt = await client.getTransactionReceipt({ hash: txHash })
    const tx = await client.getTransaction({ hash: txHash })

    if (!receipt || !tx) return false
    if (tx.from.toLowerCase() !== address.toLowerCase()) return false
    if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) return false
    if (tx.value !== parseEther(betAmount)) return false
}
export const createGame = async (betAmount: string, topic: string, slug: string, address: `0x${string}` | undefined, txHash: `0x${string}`) => {
    const prisma = (await import("@/db")).default;

    if (!address) return { msg: "address is empty", slug: "" };

    const user = await prisma.user.upsert({
        where: { address },
        update: {},
        create: { address }
    });

    if (!user) return { msg: "Error in creating User", slug: "" };
    const verify = await verifyTransaction(txHash,address,betAmount)
    if (!verify) return { msg: "Can't Verify this Transaction", slug: "" };

    

    // const slug = generateSlug();
    const bet = await prisma.bet.create({
        data: { slug, creatorId: address, amount: betAmount, topic }
    });

    if (!bet) return { msg: "Error in creating Bet", slug: "" };

    return { msg: "Bet Created Successfully!", slug };
};

export const startCreatorGame = async (slug: string, address: `0x${string}` | undefined) => {
    const prisma = (await import("@/db")).default;

    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) return { msg: "Oops No bet exists for this Game Id", content: null };

    if ((bet.creatorId !== address) && (bet?.joinerId !== address)) {
        return { msg: "You are not authorized for this bet", content: null };
    }

    if ((bet.creatorId === address && bet.creatorCompleted) || (bet?.joinerId === address && bet.joinerCompleted)) {
        return { msg: "You have already completed this bet!", content: null };
    }

    const chatCompletion = await getGroqChatCompletion(bet.topic);
    const raw = chatCompletion.choices[0]?.message?.content || '';

    const jsonString = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');

    const allQuestions = await prisma.question.findMany({ where: { slug } });
    if (allQuestions.length !== 0) {
        const stripped = allQuestions.map(({ question, options }) => ({ question, options }));
        return { msg: 'success', content: { questions: stripped } };
    }

    try {
        const parsed = JSON.parse(jsonString);
        const allPromises = parsed.questions.map((item:Question) =>
            prisma.question.create({
                data: { question: item.question, correctIndex: item.correctIndex, options: item.options, slug }
            })
        );
        await Promise.all(allPromises);

        const stripped = parsed.questions.map(({ question, options }: { question: string; options: string[] }) => ({ question, options }));
        return { msg: 'success', content: { questions: stripped } };
    } catch (err) {
        console.error('Failed to parse LLM JSON:', err, raw);
        return { msg: 'Failed to parse quiz content', content: null };
    }
};

export async function getGroqChatCompletion(topic: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Generate 15 multiple-choice questions (MCQs) about ${topic} for a trivia quiz. Follow these rules:
                1. Format: Strictly use JSON format with keys: questions, question, options, correctIndex.
                2. Difficulty: Suitable for adults with general knowledge.
                3. Options: 4 per question, 1 correct. Distractors must be plausible.
                4. Sub-topics: Include physics, chemistry, biology, and astronomy.
                5. Avoid trick questions or overly technical terms.`,
            },
        ],
        model: "llama-3.3-70b-versatile",
    });
}

export const isBetValid = async (slug: string, address: `0x${string}` | undefined) => {
    const prisma = (await import("@/db")).default;

    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) return { msg: `Oops No bet exists for Game ID: ${slug}`, isValid: false };

    if (bet.joinerCompleted && bet.creatorCompleted) {
        return { msg: `Bet is already resolved`, isValid: false };
    }

    if (bet.creatorId !== address && !bet.joinerId) {
        return { msg: `You can join the bet by paying ${bet.amount}`, isValid: true, amount: bet.amount, topic: bet.topic };
    }

    return { msg: "You can play game", isValid: true };
};

export const userValidity = async (slug: string, address: `0x${string}` | undefined) => {
    const prisma = (await import("@/db")).default;

    if (!address) return { msg: "address is empty", slug: "" };

    const user = await prisma.user.upsert({
        where: { address },
        update: {},
        create: { address }
    });

    if (!user) return { msg: "Error in creating User" };

    const bet = await prisma.bet.update({
        where: { slug },
        data: { joinerId: address }
    });

    if (!bet) return { msg: "Error in updating Bet" };

    return { msg: "Bet Joined Successfully!" };
};

export const calculateScore = async (answers: (number | null)[], slug: string, address: `0x${string}` | undefined) => {
    const prisma = (await import("@/db")).default;

    if (answers.length === 0 || !address || !slug) return 0;

    const questionWithAnswers = await prisma.question.findMany({ where: { slug } });
    const bet = await prisma.bet.findFirst({ where: { slug } });

    const score = questionWithAnswers.reduce((acc, question, index) => {
        return acc + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    if (bet?.creatorId === address) {
        await prisma.bet.update({
            where: { slug },
            data: { creatorCompleted: true, cretorScore: score }
        });
    } else {
        await prisma.bet.update({
            where: { slug },
            data: { joinerCompleted: true, joinerScore: score }
        });
    }

    return score;
};

export const CheckWinner = async (slug: string) => {
    const prisma = (await import("@/db")).default;

    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) {
        return { msg: `Oops No bet exists for Game ID: ${slug}`, creatorScore: null, joinerScore: null, winner: null };
    }

    if (bet.joinerCompleted && bet.creatorCompleted) {
        return { msg: `Winner will get amount Shortly!`, creatorScore: bet.cretorScore, joinerScore: bet.joinerScore, winner: bet.winner };
    }

    return { msg: `Bet is not completed yet`, creatorScore: bet.cretorScore, joinerScore: bet.joinerScore, winner: bet.winner };
};

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
}
