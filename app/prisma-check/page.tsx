import prisma from "@/db"
import React from "react";

const PrismaCheckPage = async () => {
    const user = await prisma.bet.findMany();
    return (
        <div>
            <h1 className="text-3xl font-bold">Prisma Check</h1>
            <p className="text-lg">User Count: {user.length}</p>
           
        </div>
    );
};

export default PrismaCheckPage;