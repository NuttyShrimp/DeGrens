interface Option {
	/*
	 * The value must be the full name eg. 'fas fa-home'
	 */
	icon: string;
	label: string;
	/*
	 * Array of strings, each string is the name of an item. The player must have all items to be able to see this entry
	 */
	items?: string | string[];
	/*
	 * This will be called each time the target is valid for this entry
	 * This means no expensive operations should be done here
	 */
	canInteract?: (entity: number, distance: number, data: Option) => boolean;
	job?:
		| string
		| string[]
		| {
				/*
				 * The number is the minimum grade the player needs to have
				 */
				[jobName: string]: number;
		  };
	gang?: string | string[];
	/*
	 * If the dist for this option is diff fron the parameters one
	 */
	distance?: number;
	/*
	 * Tie extract info to the option if needed
	 */
	data?: any;
}

interface EventOption extends Option {
	type: "client" | "server";
	event: string;
}

interface FunctionOption extends Option {
	action: (data: Option, entity: number) => void;
}

type AllOption = EventOption & FunctionOption;

interface PeekParams {
	options: (EventOption | FunctionOption | AllOption)[];
	distance?: number;
}

export class Peek {
	// Adders
	public static addModelEntry(model: string | number | (string | number)[], PeekParams: PeekParams): number[] {
		return global.exports["dg-peek"].addModelEntry(model, PeekParams);
	}

	public static addEntityEntry(model: number | number[], PeekParams: PeekParams): number[] {
		return global.exports["dg-peek"].addEntityEntry(model, PeekParams);
	}

	public static addBoneEntry(model: string | string[], PeekParams: PeekParams): number[] {
		return global.exports["dg-peek"].addBoneEntry(model, PeekParams);
	}

	public static addFlagEntry(model: string | string[], PeekParams: PeekParams): number[] {
		return global.exports["dg-peek"].addFlagEntry(model, PeekParams);
	}

	public static addZoneEntry(model: string | string[], PeekParams: PeekParams): number[] {
		return global.exports["dg-peek"].addZoneEntry(model, PeekParams);
	}

	// Removers
	public static removeModelEntry(ids: number | number[]) {
		return global.exports["dg-peek"].removeModelEntry(ids);
	}

	public static removeEntityEntry(ids: number | number[]) {
		return global.exports["dg-peek"].removeEntityEntry(ids);
	}

	public static removeBoneEntry(ids: number | number[]) {
		return global.exports["dg-peek"].removeBoneEntry(ids);
	}

	public static removeFlagEntry(ids: number | number[]) {
		return global.exports["dg-peek"].removeFlagEntry(ids);
	}

	public static removeZoneEntry(ids: number | number[]) {
		return global.exports["dg-peek"].removeZoneEntry(ids);
	}
}
