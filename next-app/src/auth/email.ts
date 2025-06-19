import { MessageAttachment, SMTPClient } from "emailjs";
import { promises } from "fs";

const client = new SMTPClient({
	user: process.env.SMTP_EMAIL,
	password: process.env.SMTP_PASSWORD,
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	ssl: true,
});

export type MailProps = {
	name: string;
	email: string;
	subject: string;
	html?: {
		file: string;
		replacements?: Record<string, string | string>;
		replaceAll?: boolean;
	};
	textContent: string;
	attachments?: MessageAttachment[];
};

export const sendEmail = async (props: MailProps): Promise<true | string> => {
	let htmlContent: string | undefined = undefined;

	if (props.html !== undefined) {
		try {
			htmlContent = await promises.readFile(props.html.file, "utf8");
		} catch (error) {
			console.error(error);
			return "Internal server error. Please try again later.";
		}

		if (props.html.replacements !== undefined) {
			for (const [key, value] of Object.entries(props.html.replacements)) {
				if (props.html.replaceAll === true) {
					htmlContent = htmlContent.replaceAll(`{{${key}}}`, value);
				} else {
					htmlContent = htmlContent.replace(`{{${key}}}`, value);
				}
			}
		}
	}

	let emailAttachments: MessageAttachment[] = [];

	if (props.attachments !== undefined) {
		emailAttachments = props.attachments;
	}

	if (htmlContent !== undefined) {
		emailAttachments.push({ data: htmlContent, alternative: true });
	}

	try {
		if (!process.env.SMTP_EMAIL) throw "SMTP_EMAIL not set";
		await client.sendAsync({
			text: props.textContent,
			from: "Gatekeeper Events " + process.env.SMTP_EMAIL,
			to: props.name + " " + props.email,
			subject: props.subject,
			attachment: emailAttachments.length > 0 ? emailAttachments : undefined,
		});
	} catch (err) {
		console.error(err);
		return "Internal server error. Please try again later.";
	}

	return true;
};
