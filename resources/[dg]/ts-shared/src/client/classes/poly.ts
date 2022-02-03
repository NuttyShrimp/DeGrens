import { Vector3 } from "fivem-js";

export class PolyTarget {
	static addBoxZone(
		name: string,
		pCenter: Vector3 | Coords,
		pWidth: number,
		pLength: number,
		options: {
			heading?: number;
			data: Object;
			minZ?: number;
			maxZ?: number;
		}
	) {
		if (pCenter instanceof Vector3) {
			pCenter = pCenter.add(0);
		}
		exports["dg-polytarget"].AddBoxZone(name, pCenter, pWidth, pLength, options);
	}
}
