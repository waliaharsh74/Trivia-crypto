
'use server'
import { generateSlug } from "random-word-slugs";
import prisma from "@/db"

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export const getUniqueSlug = async (betAmount: string, topic: string, address: `0x${string}` | undefined) => {
    if (!address) return {
        msg: "addresss is empty",
        slug: ""
    }
    const user = await prisma.user.upsert({
        where: {
            address
        },
        update: {},
        create: {
            address
        }

    })
    if (!user) {
        return {
            msg: "Error in creating User",
            slug: ""
        }
    }

    const slug = generateSlug();
    const bet = await prisma.bet.create({
        data: {
            slug,
            creatorId: address,
            amount: betAmount,
            topic
        }
    })
    if (!bet) {
        return {
            msg: "Error in creating Bet",
            slug: ""
        }
    }
    return { msg: "Bet Created Succesfully!", slug }


}
export const startCreatorGame = async (slug: string, address: `0x${string}` | undefined) => {

    const bet = await prisma.bet.findFirst({
        where: { slug }
    })
    if (!bet) {
        return {
            msg: "Oops No bet exists for this Game Id",
            content: null
        }
    }

    if ((bet.creatorId != address) && (bet?.joinerId != address)) {

        return {
            msg: "You are not authorised for this bet",
            content: null
        }
    }

    if ((bet.creatorId == address && bet.creatorCompleted) || (bet?.joinerId == address && bet.joinerCompleted)) {
        
        return {
            msg: "you have already completed this bet!",
            content: null
        }
    }

    const chatCompletion = await getGroqChatCompletion(bet?.topic);
    console.log(chatCompletion.choices[0]?.message?.content || "");

    const raw = chatCompletion.choices[0]?.message?.content || '';


    const jsonString = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');

    let parsed: { questions: Question[] };
    let stripped

    const allQuestions = await prisma.question.findMany({
        where: {
            slug
        }
    })
    if (allQuestions.length != 0) {
        stripped = allQuestions.map(({ question, options }) => ({
            question,
            options
        }));
        return { msg: 'success', content: { questions: stripped } };
    }
    try {
        parsed = JSON.parse(jsonString);
        const allPromises = parsed.questions.map((item) =>
            prisma.question.create({
                data: {
                    question: item.question,
                    correctIndex: item.correctIndex,
                    options: item.options,
                    slug
                }
            })
        )
        await Promise.all(allPromises)
        stripped = parsed.questions.map(({ question, options }) => ({
            question,
            options
        }));
    } catch (err) {
        console.error('Failed to parse LLM JSON:', err, raw);
        return { msg: 'Failed to parse quiz content', content: null };
    }


    // return { msg: 'success', content: { questions: stripped } } ;
    return { msg: 'success', content: parsed };


}
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
    const bet = await prisma.bet.findFirst({
        where: { slug }
    })
    if (!bet) {
        return {
            msg: `Oops No bet exists for the Game Id with name: ${slug}`,
            isValid: false
        }
    }
    if (bet.joinerCompleted && bet.creatorCompleted) {
        return {
            msg: `Bet is already resolved`,
            isValid: false
        }
    }
    if (bet.creatorId !== address && !bet.joinerId) {
        return {
            msg: `you can join the bet by paying ${bet.amount}`,
            isValid: true,
            amount: bet.amount,
            topic: bet.topic
        }
    }
    return {
        msg: "you can play game",
        isValid: true
    }


}
export const userValidity = async (slug: string, address: `0x${string}` | undefined) => {
    if (!address) return {
        msg: "addresss is empty",
        slug: ""
    }
    const user = await prisma.user.upsert({
        where: {
            address
        },
        update: {},
        create: {
            address
        }

    })
    if (!user) {
        return {
            msg: "Error in creating User",

        }
    }
    const bet = await prisma.bet.update({
        where: {
            slug
        },
        data: {
            joinerId: address

        }
    })
    console.log("bet", bet);
    if (!bet) {
        return {
            msg: "Error in updating Bet",

        }
    }
    return {
        msg: "Bet Joined Successfully!",
    }
}
export const calculateScore = async (answers: (number | null)[], slug: string, address: `0x${string}` | undefined) => {
    if (answers.length == 0 || !address || !slug) {
        return 0
    }
    const questionWithAnswers = await prisma.question.findMany({
        where: {
            slug
        }
    })
    const bet=await prisma.bet.findFirst({
        where:{
            slug
        }
    })
    const score = questionWithAnswers.reduce((acc, question, index) => {
        return acc + (answers[index] === question.correctIndex ? 1 : 0)
    }, 0)
    if(bet?.creatorId==address){
        await prisma.bet.update({
            where:{
                slug
            },
            data:{
                creatorCompleted:true,
                cretorScore:score
            }
        })
    }else{
        await prisma.bet.update({
            where: {
                slug
            },
            data: {
                joinerCompleted: true,
                joinerScore:score
            }
        })
    }
  
    return score

}
export const CheckWinner = async (slug: string) => {
 
   
    const bet=await prisma.bet.findFirst({
        where:{
            slug
        }
    })
    if(!bet){
        return {
            msg: `Oops No bet exists for the Game Id with name: ${slug}`,
         
            creatorScore:null,
            joinerScore: null,
            winner: null
        }
    }
    if (bet.joinerCompleted && bet.creatorCompleted) {
        return {
            msg: `Winner will get amount Shortly!`,
         
            creatorScore:bet.cretorScore,
            joinerScore:bet.joinerScore,
            winner:bet?.winner
        }
    }
    return {
     
            msg: `bet is not completed yet`,
      
            creatorScore:bet.cretorScore,
            joinerScore:bet.joinerScore,
            winner:bet?.winner
        
    }
   
}
interface Question {
    question: string
    options: string[]
    correctIndex: number
}