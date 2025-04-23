
'use server'
import { generateSlug } from "random-word-slugs";
import prisma from "@/db"

export const getUniqueSlug = async ()=>{

    const slug = generateSlug();
    return slug
    
    
}

export const handleStartGame = async () => {

    const user = await prisma.user.findMany()
    console.log(user);

}