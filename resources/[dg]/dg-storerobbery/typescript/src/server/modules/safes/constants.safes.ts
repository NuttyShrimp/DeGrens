export const BUSY_MESSAGE: Record<Exclude<Storerobbery.SafeState, 'closed'>, string> = {
  decoding: 'De kluis  is aan het decoderen',
  looted: 'De kluis is leeg',
  opened: 'De kluis staat open',
};
