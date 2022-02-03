export interface Action<H = undefined> {
	label?: string;
	icon: string;
	handler: (d: H) => void;
}
