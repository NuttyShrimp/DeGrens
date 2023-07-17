declare type State = {
  state: 0 | 1 | 2;
  inCall: boolean;
  isMuted: boolean;
  isDisabled: boolean;
  hasPhone: boolean;
  inputFocused: boolean;
};

declare type JusticeState = {
  srvId: number;
  // Char name
  name: string;
  phone: string;
  available: boolean;
};

declare type Message = {
  id: number;
  message: string;
  isread: boolean;
  isreceiver: boolean;
  date: number;
};

declare type Note = {
  id: number;
  title: string;
  note: string;
  date: number;
  readonly?: boolean;
};

declare type NoteShareType = 'local' | 'permanent';

declare type PendingNoteShare = {
  id: string;
  noteId: number;
  origin: number;
  target: number;
  type: 'local' | 'permanent';
};

declare type TweetStatus = {
  liked: boolean;
  retweeted: boolean;
};

declare type StoredTweet = Omit<Tweet, 'liked' | 'retweeted'> & {
  liked: number[];
  retweeted: number[];
};

declare type Tweet = Partial<TweetStatus> & {
  sender_name: string;
  like_count: number;
  retweet_count: number;
  id: number;
  cid?: number;
  tweet: string;
  sender_name: string;
  // milisecond unix timestamp
  date: number;
};

declare type Ad = {
  id: number;
  name: string;
  phone: string;
  text: string;
};
