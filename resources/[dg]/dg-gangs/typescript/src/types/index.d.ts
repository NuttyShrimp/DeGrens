declare namespace Gangs {
  type ChatMessage = {
    id?: number;
    sender: string;
    cid: number;
    message: string;
    date: number;
    gang: string;
  };
}
