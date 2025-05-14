'use server'

import { generateSlug } from "random-word-slugs";
import Groq from "groq-sdk";
import { createPublicClient, http, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { wagmiAbi } from "@/utils/Abt";
import { keccak256, toBytes } from 'viem'
import prisma from "@/db"


import { ethers } from "ethers";

const client = createPublicClient({
    chain: sepolia, 
    transport: http()
})

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const RPC = process.env.RPC_URL!;
const ORACLE_PK = process.env.ORACLE_PK! as `0x${string}`

const provider = new ethers.JsonRpcProvider(RPC);
const oracle = new ethers.Wallet(ORACLE_PK, provider);

const CONTRACT_ADDRESS ='0x0be41344a98b13a8537577f4537de3c48a36ba85'
const trivia = new ethers.Contract(CONTRACT_ADDRESS, wagmiAbi, oracle);
export const getUniqueSlug = async () => {
    // 

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
    
    const jsonString = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');

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
                5. Avoid trick questions or overly technical terms.
                6. Output strictly in JSON format with no preamble or explanation.`
            },
        ],
        model: "llama-3.3-70b-versatile",
    });
}

export const isBetValid = async (slug: string, address: `0x${string}` | undefined) => {
    

    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) return { msg: `Oops No bet exists for Game ID: ${slug}`, isValid: false };

    if (bet.joinerCompleted && bet.creatorCompleted && bet.winner) {
        return { msg: `Bet is already resolved`, isValid: false };
    }
    if (bet.joinerCompleted && bet.creatorCompleted ) {
        return { msg: `Bet is completed by both players`, isValid: false };
    }

    if (bet.creatorId !== address && !bet.joinerId) {
        return { msg: `You can join the bet by paying ${bet.amount} Eth`, isValid: true, amount: bet.amount, topic: bet.topic,bet };
    }

    return { msg: "You can play game", isValid: true, amount: bet.amount, topic: bet.topic,bet };
};

export const userValidity = async (slug: string, address: `0x${string}` | undefined, txHash: `0x${string}`,betAmount:string) => {
    

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
export const updateWinner = async (slug: string) => {
    

    if (!slug) return { msg: "slug is empty" };
    const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: wagmiAbi,
        functionName: 'getBet',
        args: [slug],
    }) as Bet
    console.log(data);
    

    const bet = await prisma.bet.update({
        where: { slug },
        data:{winner:data.winner},

        
    });

    if (!bet) return { msg: "Error in finding Bet" };





    


    return { msg: "Bet Resolved Successfully!" };
};

export const calculateScore = async (answers: (number | null)[], slug: string, address: `0x${string}` | undefined) => {
    
   
    if (answers.length === 0 || !address || !slug) return {score:0};

    const questionWithAnswers = await prisma.question.findMany({ where: { slug } });
    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) return { score: 0, sig: `0x` };

    const score = questionWithAnswers.reduce((acc, question, index) => {
        return acc + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    if (bet?.creatorId === address) {
        if (bet.creatorCompleted) return { score: bet?.cretorScore ||0 };
        await prisma.bet.update({
            where: { slug },
            data: { creatorCompleted: true, cretorScore: score }
        });
        const tx = await trivia.submitScore(slug, address, score);
        console.log("score tx:", tx.hash);
        await tx.wait(1);  
    } else {
        if (bet?.joinerCompleted) return { score: bet?.joinerScore || 0 };

        await prisma.bet.update({
            where: { slug },
            data: { joinerCompleted: true, joinerScore: score }
        });
        const tx = await trivia.submitScore(slug, address, score);
        console.log("score tx:", tx.hash);
        await tx.wait(1);  
    }
  

   
    

    return {
        score,
       
    }
};

export const CheckWinner = async (slug: string) => {
    

    const bet = await prisma.bet.findFirst({ where: { slug } });
    if (!bet) {
        return { msg: `Oops No bet exists for Game ID: ${slug}`, creatorScore: null, joinerScore: null, winner: null ,canResolve:false};
    }

    if (bet.joinerCompleted && bet.creatorCompleted && bet.winner) {
        return { msg: `Bet is resolved Already!`, creatorScore: bet.cretorScore, joinerScore: bet.joinerScore, winner: bet?.winner, canResolve :false};
    } 
    if (bet.joinerCompleted && bet.creatorCompleted && bet.cretorScore && bet.joinerScore) {
        const winner = (bet?.cretorScore > bet?.joinerScore) ? bet.creatorId : bet.joinerId
        return { msg: `Resolve this Bet for Winner!`, creatorScore: bet.cretorScore, joinerScore: bet.joinerScore, winner, canResolve:true };
    }

    return { msg: `Bet is not completed yet`, creatorScore: bet.cretorScore, joinerScore: bet.joinerScore, winner: bet.winner, canResolve:false };
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

