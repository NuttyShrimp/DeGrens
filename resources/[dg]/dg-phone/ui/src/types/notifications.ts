export interface PhoneNotificationIcon {
	name: string;
	color: string;
	background: string;
	backgroundGradient?: string;
	lib?: string;
}

export interface PhoneNotification {
	// Unique Id so we can change te notification when visible when this would be needed (think about calls)
	id: string;
	title: string;
	description: string;
	sticky?: boolean;
	actionWithRemove?: boolean;
	// Can be an appName or a custom icon
	icon: string | PhoneNotificationIcon;
	// String is for external usage, Function should only be use inside this vue project so we don't need to capture unnecessary events
	onAccept?: string | Function;
	onDecline?: string | Function;
	_data?: any;
	timer?: number;
}
