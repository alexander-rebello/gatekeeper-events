import { PrismaClient } from "@prisma/client";

declare global {
	namespace NodeJS {
		interface Global {}
	}
}

interface customNodeJSGlobal extends NodeJS.Global {
	prisma: PrismaClient;
}

declare const global: customNodeJSGlobal;

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
