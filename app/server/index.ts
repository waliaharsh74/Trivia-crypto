
'use server'
import { generateSlug } from "random-word-slugs";
import prisma from "@/db"
import OpenAI from "openai";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const getUniqueSlug = async (betAmount: string, topic: string, address: `0x${string}` | undefined) => {
    if(!address)return{
        msg:"addresss is empty",
        slug:""
    }
    const user=await prisma.user.upsert({
        where:{
            address
        },
        update:{},
        create:{
            address
        }
        
    })
    if(!user){
       return {
        msg:"Error in creating User",
        slug:""
       }
    }
  
    const slug = generateSlug();
    const bet = await prisma.bet.create({
        data: {
            slug,
            creatorId:address ,
            amount:betAmount,
            topic
        }
    })
    if (!bet) {
        return {
            msg: "Error in creating Bet",
            slug: ""
        }
    }
    return { msg: "Bet Created Succesfully!", slug}


}

export const startCreatorGame = async (slug: string, address: `0x${string}` | undefined) => {
   
    const bet = await prisma.bet.findFirst({
        where:{slug}
    })
    if(!bet){
        return {
            msg: "Oops No bet exists for this Game Id",
            content: null
        }
    }
  
    if((bet.creatorId!=address ) && (bet?.joinerId!=address)){
        console.log(bet.creatorId);
        console.log("object");
        console.log(address);
        return {
            msg: "You are not authorised for this bet",
            content: null
        }
    }
  
    if((bet.creatorId==address && bet.creatorCompleted) || (bet?.joinerId==address && bet.joinerCompleted)){
        return {
            msg: "you have already completed this bet!",
            content: null
        }
    }

    const chatCompletion = await getGroqChatCompletion(bet?.topic);
    console.log(chatCompletion.choices[0]?.message?.content || "");
    
    const raw = chatCompletion.choices[0]?.message?.content || '';


    const jsonString = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');

    let parsed: { questions: any[] };
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        console.error('Failed to parse LLM JSON:', err, raw);
        return { msg: 'Failed to parse quiz content', content: null };
    }

   
    return { msg: 'success', content: parsed };


}
export async function getGroqChatCompletion(topic:string) {
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