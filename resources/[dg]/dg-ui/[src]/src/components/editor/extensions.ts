import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  GapCursorExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  OrderedListExtension,
  StrikeExtension,
  TaskListExtension,
  TrailingNodeExtension,
  UnderlineExtension,
} from 'remirror/extensions';

export type ExtensionsType =
  | GapCursorExtension
  | HardBreakExtension
  | ItalicExtension
  | StrikeExtension
  | UnderlineExtension
  | BlockquoteExtension
  | BulletListExtension
  | OrderedListExtension
  | TaskListExtension
  | LinkExtension
  | BoldExtension
  | HeadingExtension
  | TrailingNodeExtension;

const DEFAULT_OPTIONS = {
  ...BoldExtension.defaultOptions,
  ...TrailingNodeExtension.defaultOptions,
};

export const getExtensions = (): ExtensionsType[] => {
  const gapCursorExtension = new GapCursorExtension();
  const hardBreakExtension = new HardBreakExtension();
  const italicExtension = new ItalicExtension();
  const strikeExtension = new StrikeExtension();
  const underlineExtension = new UnderlineExtension();
  const blockquoteExtension = new BlockquoteExtension();
  const bulletListExtension = new BulletListExtension();
  const orderedListExtension = new OrderedListExtension();
  const taskListExtension = new TaskListExtension({});
  const linkExtension = new LinkExtension({ autoLink: true });

  const { weight } = DEFAULT_OPTIONS;
  const boldExtension = new BoldExtension({ weight });

  const headingExtension = new HeadingExtension({ defaultLevel: 1, levels: [1, 2, 3] });

  const { disableTags, ignoredNodes, nodeName } = DEFAULT_OPTIONS;
  const trailingNodeExtension = new TrailingNodeExtension({
    disableTags,
    ignoredNodes,
    nodeName,
  });

  /*
  Following extensions are nice but not added as I don't see a good use case for them
  - https://remirror.io/docs/extensions/text-highlight-extension/
   */

  return [
    gapCursorExtension,
    hardBreakExtension,
    italicExtension,
    strikeExtension,
    underlineExtension,
    blockquoteExtension,
    bulletListExtension,
    orderedListExtension,
    taskListExtension,
    linkExtension,
    boldExtension,
    headingExtension,
    trailingNodeExtension,
  ];
};
