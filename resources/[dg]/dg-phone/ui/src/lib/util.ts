import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import URI from 'urijs';
import 'dayjs/locale/nl-be';

export const formatRelativeTime = (time: number) => {
	dayjs.extend(relativeTime).locale('nl-be');
	return dayjs(time).fromNow();
};

// https://stackoverflow.com/questions/19395458/check-if-a-link-is-an-image
const isUriImage = (uri: string): boolean => {
	//make sure we remove any nasty GET params
	uri = uri.split('?')[0];
	//moving on, split the uri into parts that had dots before them
	const parts = uri.split('.');
	//get the last part ( should be the extension )
	const extension = parts[parts.length - 1];
	//define some image types to test against
	const imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];
	//check if the extension matches anything in the list.
	return imageTypes.indexOf(extension) !== -1;
};

export const checkImageValidity = (url: string): Promise<boolean> => {
	if (!isUriImage(url)) {
		return Promise.resolve(false);
	}
	const image = new Image();
	return new Promise(resolve => {
		image.onload = () => resolve(true);
		image.onerror = () => resolve(false);
		image.src = url;
	});
};

export const extractLinks = (text: string): { text: string; links: string[] } => {
	const links: string[] = [];
	URI.withinString(text, (url: string) => {
		if (isUriImage(url)) {
			links.push(url);
			text = text.replace(url, '');
		}
		return text;
	});
	return {
		text: text.trim(),
		links,
	};
};

const IllegalTags = [
	'script',
	'style',
	'iframe',
	'frame',
	'frameset',
	'object',
	'embed',
	'link',
	'embed',
	'meta',
	'head',
	'title',
];

export const sanitizeText = (text: string): string => {
	IllegalTags.forEach(t => {
		text = text.replace(new RegExp(`<${t}\b[^<]*(?:(?!</${t}>)<[^<]*)*</${t}>`, 'gi'), '');
	});
	return text.trim();
};

export const getFirstLine = (text: string): string => {
	// Split on \n & <br>
	const lines = text.split(/\n|<br>/);
	return lines[0];
};
