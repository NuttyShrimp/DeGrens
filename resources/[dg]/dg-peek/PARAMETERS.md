# Parameter object

Here you can find the typescript equivalent of the parameter object you pass through the entry adders

```typescript
interface Option {
  // The value must be the full name eg. 'fas fa-home'
  icon: string;
  label: string;
  // Array of strings, each string is the name of an item. The player must have all items to be able to see this entry
  items?: string | string[];
  // This will be called each time the target is valid for this entry
  // This means no expensive operations should be done here
  canInteract?: (entity: number, distance: number, data: Option) => boolean;
  job?: string | string[] | {
    // The number is the minimum grade the player needs to have
    [jobName: string]: number;
  }
  gang?: string | string[]
  // If the dist for this option is diff fron the parameters one
  distance?: number
  // Tie extract info to the option if needed
  data?: any;
  // Allow option to be viewed while player is inside vehicle
  allowInVehicle?: boolean
}

interface EventOption extends Option {
  type: 'client' | 'server';
  event: string
}

interface FunctionOption extends Option {
  action: (data: Option, entity: number) => void;
}

interface parameters {
  options: (EventOption | FunctionOption)[];
  distance?: number;
}
```