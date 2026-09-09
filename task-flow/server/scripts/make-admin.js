import "dotenv/config";
import prisma from "../lib/prisma.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error(
        "Usage: npm run make-admin -- your-email@example.com"
    );

    process.exitCode = 1;
} else {
    try {
        const user = await prisma.user.update({
            where: {
                email,
            },
            data: {
                role: "SYSTEM_ADMIN",
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        console.log(
            `Admin enabled for ${user.email}. Log out and back in.`
        );
    } catch (error) {
        if (error?.code === "P2025") {
            console.error(
                `No registered user was found for ${email}. Register the account first.`
            );

            process.exitCode = 1;
        } else {
            throw error;
        }
    } finally {
        await prisma.$disconnect();
    }
}