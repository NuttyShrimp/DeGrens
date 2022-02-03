import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/nl-be';
import { events } from './nui/events';
import { nuiAction } from './nui/action';

export const formatRelativeTime = (time: number) => {
	dayjs.extend(relativeTime).locale('nl-be');
	return dayjs(time).fromNow();
};

export const listener = (event: MessageEvent) => {
	const item = event.data;
	if (item?.source?.match?.('vue-devtools')) return;
	if (!item?.action || !events?.[item.action]) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Unknown event', item);
		}
		return;
	}
	events[item.action](item.data);
};

export const keyListener = (event: KeyboardEvent) => {
	if (event.key === 'Escape') {
		nuiAction('close');
	}
};

const formatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 2 };
const formatter = new Intl.NumberFormat('nl-BE', formatOptions);

export const toEuroFormat = (val: string | number) => {
	return formatter.format(Number(val));
};
