import { peekChat } from './chat';

const oldSuggestions: Set<Shared.Command> = new Set();

export const getOldSuggestions = (): Shared.Command[] => [...oldSuggestions];

export const addOldSuggestion = (
  cmdName: string,
  description: string,
  parameters: { name: string; help: string }[] = []
) => {
  const newParams: Shared.Parameter[] = parameters.map(({ name, help }) => ({
    name,
    description: help,
  }));
  cmdName = cmdName.replace(/^\//, '');
  const suggestion = {
    name: cmdName,
    description,
    parameters: newParams,
  };
  oldSuggestions.add(suggestion);
  SendNUIMessage({
    action: 'addSuggestion',
    data: suggestion,
  });
};

export const addOldMessage = (data: {
  color?: [number, number, number];
  multiline?: boolean;
  author?: string;
  template: string;
  args?: string[];
}) => {
  data.template = data.template ?? '{0}';
  const newMsg: Shared.Message = {
    prefix: '',
    type: 'normal',
    message: data.template.replace(/{(\d+)}/g, (match, number) => {
      return data.args[number] ?? match;
    }),
  };
  peekChat();
  SendNUIMessage({
    action: 'addMessage',
    data: newMsg,
  });
};
