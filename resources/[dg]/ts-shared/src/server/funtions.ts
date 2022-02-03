export const Notify = (
	src: number,
	text: string,
	type: "success" | "error" | "primary" = "primary",
	timeout: number = 5000
) => {
	emitNet("DGCore:Notify", src, text, type, timeout);
};
