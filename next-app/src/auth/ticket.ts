import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { MessageAttachment, SMTPClient } from "emailjs";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import archiver from "archiver";
import path from "path";
import prisma from "@/db/client";
import { formatDate } from "@/components/utils";
import { sendEmail } from "./email";

type TicketFields = {
	type: string;
	name: string;
	code: string;
	description: string;
};

type InfoFields = {
	orderId: number;
	orderUUID: string;
	orderDate: Date;
	organizer: string;
	location: string;
	title: string;
	startDate: Date;
	endDate: Date;
	eventDescription: string;
	email: string;
	name: string;
};

type DocumentFields = {
	ticketFields: TicketFields;
	infoFields: InfoFields;
};

const zipThreshold = 10; // Threshold for zipping tickets

// With async/await
const generateQR = async (text: string) => {
	try {
		return await QRCode.toDataURL(text, {
			errorCorrectionLevel: "H",
		});
	} catch (err) {
		console.error(err);
		return err as string;
	}
};

const generateTicketPDF = async (targetPath: string, qrCode: string, fields: DocumentFields) => {
	const fontDir = path.join(process.cwd(), "private", "fonts", "Arial");

	await new Promise((resolve, reject) => {
		const stream = createWriteStream(targetPath);
		const doc = new PDFDocument({
			compress: true,
			info: {
				Producer: "Gatekeeper",
				Creator: "Gatekeeper",
				CreationDate: new Date(),
				Title: "Ticket",
				Author: "Gatekeeper",
				Subject: "Ticket",
			},
			margins: {
				top: 20,
				bottom: 0,
				left: 20,
				right: 40,
			},
			layout: "portrait",
			size: "A4",
			lang: "de",
			font: fontDir + "/ARIAL.TTF",
		});

		doc.pipe(stream);

		doc
			.image(qrCode, {
				align: "center",
				width: 200,
				height: 200,
			})

			.fontSize(18)
			.text("Ticket:", 210, 50)
			.fontSize(30)
			.text(fields.ticketFields.type)

			.fontSize(18)
			.text("\n" + "Name:")
			.fontSize(30)
			.text(fields.ticketFields.name)

			.fontSize(18)
			.text("Ticket ID: " + fields.ticketFields.code, 50, 230)
			.text("Bestell ID: " + fields.infoFields.orderUUID)
			.text("Bestelldatum: " + formatDate(fields.infoFields.orderDate))

			.font(fontDir + "/ARIALBD.TTF")
			.text("\nTicket Details:")
			.font(fontDir + "/ARIAL.TTF")
			.text(fields.ticketFields.description)

			.font(fontDir + "/ARIALBD.TTF")
			.text("\nEvent Details:")
			.font(fontDir + "/ARIAL.TTF")
			.text("Event: " + fields.infoFields.title)
			.text("Veranstalter: " + fields.infoFields.organizer)
			.text("Ort: " + fields.infoFields.location)
			.text("\nBeginn: " + formatDate(fields.infoFields.startDate))
			.text("Ende: " + formatDate(fields.infoFields.endDate))
			.text("\nBeschreibung:")
			.text(fields.infoFields.eventDescription)

			.font(fontDir + "/ARIALBD.TTF")
			.fontSize(20)
			.text("Bereitgestellt von Gatekeeper", doc.x, 780, { align: "center" })
			.font(fontDir + "/ARIAL.TTF")
			.fontSize(18)
			.text(process.env.NEXT_PUBLIC_BASE_URL || "www.gatekeeper-events.de", doc.x, 800, { align: "center", link: process.env.NEXT_PUBLIC_BASE_URL || "www.gatekeeper-events.de" });

		doc.end();

		stream.on("finish", () => resolve(""));
		stream.on("error", reject);
	});
};

/**
 * Generates ticket PDFs with QR codes for a given set of tickets and order information,
 * stores them in a designated directory, and returns an array of email attachments.
 * If the number of tickets is greater than or equal to `zipThreshold`, or if `storeZip` is set to true,
 * all generated PDFs are additionally bundled into a zip archive.
 */
export const createTicket = async (tickets: TicketFields[], infos: InfoFields, storeZip: boolean = false) => {
	const basePath = path.join(process.cwd(), "private", "storage", "orders", infos.orderId.toString());
	const ticketsPath = path.join(basePath, "tickets");

	if (!existsSync(ticketsPath)) {
		mkdirSync(ticketsPath, { recursive: true });
	}

	let attachments: MessageAttachment[] = [];

	await Promise.all(
		tickets.map(async (ticket, index) => {
			const storagePath = path.join(ticketsPath, ticket.code + ".pdf");

			const result = await generateQR(ticket.code.toUpperCase());

			await generateTicketPDF(storagePath, result, { ticketFields: ticket, infoFields: infos });

			const filename = (ticket.name ? ticket.name.replace(/[^\w\s.-]/gi, "_") : ticket.type) + `-${index}.pdf`;

			attachments.push({
				name: filename,
				type: "application/pdf",
				path: storagePath,
			});
		})
	);

	if (attachments.length >= zipThreshold || storeZip) {
		const zipPath = path.join(basePath, "tickets.zip");
		var stream = createWriteStream(zipPath);
		var archive = archiver("zip", { zlib: { level: 9 } });

		await new Promise<void | Error>((resolve, reject) => {
			archive
				.directory(ticketsPath, false)
				.on("error", (err) => reject(err))
				.pipe(stream);

			stream.on("close", () => resolve());
			archive.finalize();
		});

		if (storeZip) return zipPath;
	}

	return attachments;
};

export async function sendTickets(infos: InfoFields, tickets: TicketFields[]): Promise<string | true> {
	const basePath = path.join(process.cwd(), "private", "storage", "orders", infos.orderId.toString());
	const ticketsPath = path.join(basePath, "tickets");

	if (!existsSync(ticketsPath)) {
		mkdirSync(ticketsPath, { recursive: true });
	}

	let attachments: MessageAttachment[] = (await createTicket(tickets, infos, false)) as MessageAttachment[];

	const zipPath = path.join(basePath, "tickets.zip");

	if (attachments.length >= zipThreshold && existsSync(zipPath)) {
		attachments = [{ name: "tickets.zip", type: "application/zip", path: zipPath }];
	}

	// Send the PDF as an attachment via email
	const result = await sendEmail({
		name: infos.name,
		email: infos.email,
		subject: "Deine Tickets für " + infos.title,
		textContent: "Hi,\n\n" + "Im Anhang findest du deine Tickets.",
		attachments: attachments,
		html: {
			file: path.join(process.cwd(), "private", "email", "tickets.html"),
			replacements: {
				NAME: infos.name,
				ORDER_ID: infos.orderUUID,
				EVENT: infos.title,
				LOCATION: infos.location,
				START: formatDate(infos.startDate),
				END: formatDate(infos.endDate),
				SIGNATURE: infos.organizer,
			},
		},
	});

	if (result !== true) {
		console.error(result);
		return "Internal error";
	}

	try {
		await prisma.order.update({
			where: {
				id: infos.orderId,
			},
			data: {
				tickets_delivered: new Date(),
			},
		});
	} catch (error) {
		console.error(error);
	}

	return true;
}
