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
