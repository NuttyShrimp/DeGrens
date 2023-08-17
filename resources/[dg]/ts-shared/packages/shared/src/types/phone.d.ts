declare namespace Phone {
  interface Icon {
    name: string;
    color: string;
    background: string;
    backgroundGradient?: string;
    lib?: string;
    size?: number;
  }
  interface Notification {
    // Unique Id so we can change te notification when visible when this would be needed (think about calls)
    id: string;
    title: string;
    description: string;
    // No timeout will be started but the notification will be removed upon action
    sticky?: boolean;
    // Does not remove the notification when accepted/declined
    keepOnAction?: boolean;
    // Can be an appName or a custom icon
    icon: Icon | string;
    // String is for external usage, Function should only be use inside this vue project so we don't need to capture unnecessary events
    onAccept?: string;
    onDecline?: string;
    _data?: any;
    timer?: number;
    app?: string;
    skipHasPhoneCheck?: boolean; // Option to skip phone check when adding notifications on charLoading because inventory will not be loaded yet
  }
}
