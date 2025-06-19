export async function verifyHCaptcha(token: string | FormDataEntryValue | null): Promise<boolean> {
	if (!token) return false;
	const hCaptchaVerifyResponse = await fetch("https://api.hcaptcha.com/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`,
	});
	const hCaptchaVerifyData = await hCaptchaVerifyResponse.json();

	return hCaptchaVerifyData.success === true;
}
