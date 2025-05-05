'use server'

import { generateSlug } from "random-word-slugs";
import Groq from "groq-sdk";
import { createPublicClient, http, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { wagmiAbi } from "@/utils/Abt";
import { keccak256, concatHex, encodePacked, toBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const client = createPublicClient({
    chain: sepolia, 
    transport: http()
})

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ORACLE_PK = process.env.ORACLE_PK! as `0x${string}`
const oracle = privateKeyToAccount(ORACLE_PK)
const SCORE_TYPEHASH = keccak256(
    toBytes("Score(bytes32 slugHash,address player,uint8 score)")
)


const CONTRACT_ADDRESS ='0xa44708ddb0ecc3b8d9eaf3538aae11926ae5dc2e'
export const getUniqueSlug = async () => {
    const prisma = (await import("@/db")).default;

    let slug = generateSlug();
    while((await prisma.bet.findFirst({where:{slug}})))
    {
        slug = generateSlug();
    }

    return { msg: "Bet Created Successfully!", slug };
};
export async function verifyTransaction(txHash: `0x${string}`, address: `0x${string}`, betAmount: string, slug: string){
    const receipt = await client.getTransactionReceipt({ hash: txHash })
    const tx = await client.getTransaction({ hash: txHash })
   

    if (!receipt || !tx) return false
    if (tx.from.toLowerCase() !== address.toLowerCase()) return false
    if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) return false
    if (tx.value !== parseEther(betAmount)) return false
    const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: wagmiAbi,
        functionName: 'getBet',
        args: [slug],
    })
    console.log(data);
    return true
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
    const verify=await verifyTransaction(txHash,address,betAmount,slug)
    if (!verify) return { msg: "Can't Verify this Transaction", slug: "" };

    

    const bet = await prisma.bet.create({
        data: { slug, creatorId: address, amount: betAmount, topic }
    });

    if (!bet) return { msg: "Error in creating Bet", slug: "" };

    return { msg: "Bet Created Successfully!", slug };
};

export const startCreatorGame = async (slug: string, address: `0x${string}` | undefined) => {
    try {
    const prisma = (await import("@/db")).default;
    const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: wagmiAbi,
        functionName: 'getBet',
        args: [slug],
    }) as Bet
    
    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet || !data) return { msg: "Oops No bet exists for this Game Id", content: null };

        if ((bet.creatorId !== address || data.creator !== address) && (bet?.joinerId !== address || data.joiner !== address)) {
        return { msg: "You are not authorized for this bet", content: null };
    }

        if (((bet.creatorId === address && bet.creatorCompleted)|| 
            (data.creator == address && data.creatorCompleted)) || 
            ((bet?.joinerId === address && bet.joinerCompleted) ||
            (data.joiner==address && data.joinerCompleted))) {
        return { msg: "You have already completed this bet!", content: null };
    }
    console.log("confirm");

    const chatCompletion = await getGroqChatCompletion(bet.topic);
    const raw = chatCompletion.choices[0]?.message?.content || '';
    
    // console.log("raw",raw);
    const jsonString = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
        // console.log("jsonst", jsonString);

    const allQuestions = await prisma.question.findMany({ where: { slug } });
    if (allQuestions.length != 0) {
        const stripped = allQuestions.map(({ question, options }) => ({ question, options }));
        return { msg: 'success', content: { questions: stripped } };
    }

    
        const parsed = JSON.parse(jsonString);
        
        const allPromises = parsed?.map((item:Question) =>
            prisma.question.create({
                data: { question: item.question, correctIndex: item.correctIndex, options: item.options, slug }
            })
        );
        console.log("allPromises",allPromises);
        await Promise.all(allPromises);

        const stripped = parsed?.map(({ question, options }: { question: string; options: string[] }) => ({ question, options }));
        return { msg: 'success', content: { questions: stripped } };
    } catch (err) {
        console.log('Failed to start game ', err);
        return { msg: 'Failed to parse quiz content', content: null };
    }
};

export async function getGroqChatCompletion(topic: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Generate 15 multiple-choice questions (MCQs) about ${topic} for a trivia quiz. Follow these rules:
                1. Format: Strictly use JSON format with keys: questionNo, question, options, correctIndex.
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
        return { msg: `You can join the bet by paying ${bet.amount} Eth`, isValid: true, amount: bet.amount, topic: bet.topic,bet };
    }

    return { msg: "You can play game", isValid: true, amount: bet.amount, topic: bet.topic,bet };
};

export const userValidity = async (slug: string, address: `0x${string}` | undefined, txHash: `0x${string}`,betAmount:string) => {
    const prisma = (await import("@/db")).default;

    if (!address) return { msg: "address is empty", userValid: false };

    const user = await prisma.user.upsert({
        where: { address },
        update: {},
        create: { address }
    });

    if (!user) return { msg: "Error in creating User", userValid :false};

    const verify = await verifyTransaction(txHash, address, betAmount, slug)
    if (!verify) return { msg: "Can't Verify this Transaction", slug: "" };

    const bet = await prisma.bet.update({
        where: { slug },
        data: { joinerId: address }
    });

    if (!bet) return { msg: "Error in updating Bet",userValid: false };

    return { msg: "Bet Joined Successfully!", userValid: true };
};

export const calculateScore = async (answers: (number | null)[], slug: string, address: `0x${string}` | undefined) => {
    const prisma = (await import("@/db")).default;
    // const sig = 0
    if (answers.length === 0 || !address || !slug) return {score:0,sig:`0x`};

    const questionWithAnswers = await prisma.question.findMany({ where: { slug } });
    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) return { score: 0, sig: `0x` };

    const score = questionWithAnswers.reduce((acc, question, index) => {
        return acc + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    if (bet?.creatorId === address) {
        if (bet.creatorCompleted) return { score: bet?.cretorScore ||0, sig: `0x` };
        await prisma.bet.update({
            where: { slug },
            data: { creatorCompleted: true, cretorScore: score }
        });
    } else {
        if (bet?.joinerCompleted) return { score: bet?.joinerScore || 0, sig: `0x` };

        await prisma.bet.update({
            where: { slug },
            data: { joinerCompleted: true, joinerScore: score }
        });
    }
    const slugHash = keccak256(encodePacked(['string'], [slug]))
    const structHash = keccak256(encodePacked(
        ['bytes32', 'address', 'uint8'],
        [slugHash, address, score]
    ))

    const digest = keccak256(concatHex(['0x1901', SCORE_TYPEHASH, structHash]))

    
    const sig = await oracle.signMessage({ message:{ raw:digest} })
    

    return {
        score,
        sig
    }
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
    questions:number
    question: string;
    options: string[];
    correctIndex: number;
}
type Bet = {
    topic: string;
    amount: bigint;
    creator: `0x${string}`;
    joiner: `0x${string}`;
    creatorCompleted: boolean;
    joinerCompleted: boolean;
    creatorScore: number;
    joinerScore: number;
    winner: `0x${string}`;
};

