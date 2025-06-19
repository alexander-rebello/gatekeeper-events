import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	await prisma.user_status.createMany({
		data: [
			{
				value: "PENDING",
			},
			{
				value: "ACTIVE",
			},
			{
				value: "DISABLED",
			},
			{
				value: "DEACTIVATED",
			},
		],
	});
	await prisma.user_role.createMany({
		data: [
			{
				value: "CUSTOMER",
			},
			{
				value: "ADMIN",
			},
		],
	});
	await prisma.ticket_type_status.createMany({
		data: [
			{
				value: "ACTIVE",
			},
			{
				value: "HIDDEN",
			},
			{
				value: "DISABLED",
			},
			{
				value: "DEACTIVATED",
			},
		],
	});
	await prisma.order_status.createMany({
		data: [
			{
				value: "PENDING",
			},
			{
				value: "COMPLETED",
			},
			{
				value: "CANCELLED",
			},
			{
				value: "REFUNDED",
			},
		],
	});
	await prisma.event_status.createMany({
		data: [
			{
				value: "PUBLIC",
			},
			{
				value: "HIDDEN",
			},
			{
				value: "DISABLED",
			},
			{
				value: "DEACTIVATED",
			},
		],
	});
	await prisma.token_type.createMany({
		data: [
			{
				value: "EMAIL",
			},
			{
				value: "PASSWORD",
			},
		],
	});
	await prisma.discount_code_status.createMany({
		data: [
			{
				value: "ACTIVE",
			},
			{
				value: "DISABLED",
			},
			{
				value: "DEACTIVATED",
			},
		],
	});

	await prisma.user.create({
		data: {
			uuid: "547b9a37-41c4-4543-8fbb-12f441fbd732",
			first_name: "Alexander",
			last_name: "Rebello",
			email: "alexander@rebello.eu",
			email_verified: new Date(),
			password: "$2b$10$Gy7CBqEq7OBVt74d.PsSXOs1GEHTMLX3/MKwUqI7znqcXCDEbRRv2",
			role: {
				connect: {
					value: "ADMIN",
				},
			},
			status: {
				connect: {
					value: "ACTIVE",
				},
			},
		},
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
