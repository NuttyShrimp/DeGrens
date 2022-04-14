# DG-Chat

There are no events from the client to the server that can create a chat message.
This is against the nasty chat spam bots.

## Server

### Exports

- addMessage, This adds a new message to the player or group of players you define. The string is part of the special
  group you can define in `messages.ts` with a filter.

```typescript
function addMessage(target: number | string, data: {
  prefix: string;
  message: string;
  // Defaults to 'normal'
  type?: 'normal' | 'warning' | 'error' | 'system' | 'success';
}) {
}
```

- refreshCommands, This sets the suggestions for commands for the player, or everyone if the parameter is left undefined

```typescript
function refreshCommands(target = -1) {
}
```

- registerCommand, This registers a command for the server.

```typescript
function registerCommand(name: string,
                         description: string,
                         parameters: {
                           name: string;
                           description?: string;
                           // Default to true
                           required?: boolean;
                         }[] = [],
                         permissionLevel: string = 'user',
                         handler: (src: number, cmd: string, args: string[]) => void) {
}
```