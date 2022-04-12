# DG-UI

## Index

Spring snel naar een App

- [DG-UI](#dg-ui)
  - [Index](#index)
  - [Lib](#lib)
  - [Exports](#exports)
  - [Events](#events)
    - [Incoming](#incoming)
    - [Outgoing](#outgoing)
  - [Apps](#apps)
    - [Debug Logs](#debug-logs)
    - [Input](#input)
    - [Interaction](#interaction)
    - [Notifications](#notifications)
      - [Exports](#exports-1)
      - [Server Events](#server-events)
    - [Context Menu](#context-menu)
      - [Example](#example)
      - [Entry interface](#entry-interface)
    - [Phone](#phone)

## Lib

To make life easier we have a lib for lua in cl_ui.lua. And for TS there are functions in ts-shared/shared/ui

## Exports

| Name             | Parameter               | Description                                                                                                                        |
| ---------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| SendUIMessage    | msg                     | Middleware to send NUI messages                                                                                                    |
| RegisterUIEvent  | event                   | Register a UI event, can be captured with an `__dg_ui:eventName` event, It's good practice to not use this but use the lib instead |
| SetUIFocus       | hasKeyboard, hasMouse   | Set the focus of the NUI                                                                                                           |
| SetUIFocusCustom | hasKeyboard, hasMouse   | Set the focus of the NUI and run keepInputFocus after is if one of the bools are true                                              |
| SendAppEvent     | app, data               | Send data to an event                                                                                                              |
| openApplication  | app, data, preventFocus | Open an application, if preventFocus is true, the application won't get NUI focus, data and preventFocus are optional              |
| closeApplication | app, data               | Close an application                                                                                                               |

## Events

### Incoming

| Name                    | Parameters | Description                                   |
| ----------------------- | ---------- | --------------------------------------------- |
| dg-ui:sendCharacterData |            | Reload the charactersdata into the UI's state |
| dg-ui:openApplication   | see above  | Open an application                           |
| dg-ui:closeApplication  | see above  | Close an application                          |

### Outgoing

Events that are sent out to handle in other resources

| Name                     | Parameter | Description                |
|--------------------------|-----------|----------------------------|
| dg-ui:application-closed | app, data | The application was closed |

## Apps

### Debug Logs

**!ONLY WORKS IF SERVER IS IN DEBUG MODE!**

List of all incoming and outgoing messages.

| action | cmd             |
| ------ | --------------- |
| show   | `ui:debug:show` |
| hide   | `ui:debug:hide` |

### Input

Open een input prompt.

Example:

```ts
global.exports['dg-ui'].openApplication('input', {
  header: 'Input prompt',
  callbackURL: 'my-app:input-callback',
  inputs: [
    {
      type: 'text',
      name: 'text',
      label: 'Text',
    },
    {
      type: 'number',
      name: 'number',
      label: 'Number',
    },
    {
      type: 'password',
      name: 'password',
      label: 'Password',
    },
    {
      type: 'select',
      name: 'select',
      label: 'Select',
      options: [
        {
          label: 'Option 1',
          value: 'option-1',
        },
        {
          label: 'Option 2',
          value: 'option-2',
        },
      ]
    },
  ]
});

// Global function defined in imported lib
RegisterUICallback('my-app:input-callback', (data, cb) => {
  // data.values contains the values of the inputs
  cb({data: {}, meta: {ok: success, message: 'done'}});
});
```

### Interaction

Toon het interacties UI. Deze heeft 3 types:

- info
- error
- success

Wordt gemanaged d.m.v exports

```ts
global.exports['dg-ui'].showInteraction('[E] DEEZ NUTS', 'error')
global.exports['dg-ui'].hideInteraction()
```

### Notifications

#### Exports

| name               | parameter                                                                                | description                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| addNotification    | text: string, texttype: 'info, success, error', durationInMs:number                      | Toont een notificatie voor standaard 5sec of durationInMs                                                                           |
| addNotification    | text: string, texttype: 'info, success, error', durationInMs:number, persistent: boolean | Toont een notificatie en retourneert de id van de notification zodat deze gebruikt kan worden om de notificatie weer te verwijderen |
| removeNotification | id: string                                                                               | Verwijdert een notificatie                                                                                                          |

#### Server Events
```lua
TriggerClientEvent('dg-ui:client:addNotifaction', source, ...)
```

### Context Menu

#### Example

```ts
global.exports['dg-ui'].openApplication('contextmenu', [
  {
    id: '1',
    title: 'Context Menu Item 1',
    icon: {
      name: 'cog',
      color: "purple",
      position: 'right',
      lib: 'far',
    },
    callbackURL: 'test-url',
  },
  {
    id: '3',
    title: 'Context Menu Item 3',
    description: 'This is a description',
    callbackURL: 'test-url',
    disabled: true,
  },
  {
    id: '4',
    title: 'Context Menu Item 4',
    icon: 'cog',
    callbackURL: 'test-url',
    submenu: [
      {
        id: '4.1',
        title: 'Context Menu Item 4.1',
        icon: 'cog',
        callbackURL: 'test-url',
      },
    ],
  },
])
```

#### Entry interface

Hieronder staat een interface in TS die representeert welke dingen je in een entry kunt toevoegen
[Link naar de file](resources/[dg]/dg-ui/[src]/src/types/apps/contextmenu.d.ts)

```ts
interface Entry {
  /**
   * Unique identifier, can be reused in subentries
   */
  id?: string;
  title: string;
  description?: string;
  /**
   * should be a fontawesome icon name as string or in name position (Minus the fas fa-) default lib is fas
   */
  icon?: string | {
    name: string;
    color?: string;
    lib?: 'fas' | 'far' | 'fal' | 'fab' | 'fad' | 'fad';
    position?: 'left' | 'right';
  };
  /**
   * Event called upo on clicking, will also be triggered when subentries are defined
   */
  callbackURL?: string;
  disabled?: boolean;
  submenu?: Entry[];
  data?: any;
}
```

### Phone

The controllers for the phone can be found in `dg-phone` resource. Sending an event to the phone is little different
with the apps We will use following pattern in the data object

```lua
SendAppEvent('phone', {
  appName,
  action,
  data = {} -- This is where you can add additional data to the event
}
```