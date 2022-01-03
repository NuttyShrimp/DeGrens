export interface Action<H = undefined> {
	label?: string;
	icon: string;
	handler: (d: H) => void;
}

type filterFunction = (item: any) => string;

export interface Search {
	list: any[];
	filter: (string | filterFunction)[];
	onChange: (list: any[]) => void;
}
