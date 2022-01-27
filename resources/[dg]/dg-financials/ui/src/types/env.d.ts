/// <reference types="vite/client" />

declare module '*.vue' {
	import { DefineComponent } from 'vue';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module 'vue-easy-spinner';

declare module 'v-tooltip' {
	import { StrictModifiers } from '@popperjs/core/lib/types';
	import { App, defineComponent, Directive } from 'vue';
	import { Placement } from '@popperjs/core';

	export interface PluginOptions {
		// Disable popper components
		disabled?: boolean; //false,
		// Default position offset [skidding, distance] (px)
		offset?: [number, number]; //[0, 5],
		// Default container where the tooltip will be appended
		container?: string; //'body',
		// Element used to compute position and size boundaries
		boundary?: Element | HTMLElement; //undefined,
		// Skip delay & CSS transitions when another popper is shown, so that the popper appear to instanly move to the new position.
		instantMove?: boolean; //false,
		// Auto destroy tooltip DOM nodes (ms)
		disposeTimeout?: number; //5000,
		// Triggers on the popper itself
		popperTriggers?: any[]; //[],
		// Positioning strategy
		strategy?: string; //'absolute',
		// Popperjs modifiers
		modifiers?: any[]; //[],
		// Other options passed to Popperjs constructor
		popperOptions?: any; // {},
		// Themes
		themes?: {
			tooltip?: {
				// Default tooltip placement relative to target element
				placement?: Placement; //'top',
				// Default events that trigger the tooltip
				triggers?: Array<'hover' | 'focus' | 'touch' | 'click'>; //'hover'|'focus'|'touch'
				// Close tooltip on click on tooltip target
				hideTriggers?: (triggers) => string[]; //events => [...events, 'click'],
				// Delay (ms)
				delay?: {
					show?: number; // 200,
					hide?: number; // 0,
				};
				// Update popper on content resize
				handleResize?: boolean; //false,
				// Enable HTML content in directive
				html?: boolean; //false,
				// Displayed when tooltip content is loading
				loadingContent?: string; //'...',
			};
			dropdown?: {
				// Default dropdown placement relative to target element
				placement?: Placement; //'bottom',
				// Default events that trigger the dropdown
				triggers?: Array<'hover' | 'focus' | 'touch' | 'click'>; //'hover'|'focus'|'touch'
				// Delay (ms)
				delay?: number; //0,
				// Update popper on content resize
				handleResize?: boolean; //true,
				// Hide on clock outside
				autoHide?: boolean; // true,
			};
			menu?: {
				$extend?: string; // 'dropdown',
				triggers?: Array<'hover' | 'focus' | 'touch' | 'click'>; //'hover'|'focus'|'touch'
				popperTriggers?: Array<'hover' | 'focus' | 'touch' | 'click'>; //'hover'|'focus'|'touch'
				delay?: {
					show?: number; // 0,
					hide?: number; //400,
				};
			};
		};
	}

	export const options: PluginOptions;
	export const VTooltip: Directive;
	export const VClosePopper: Directive;

	export function destroyTooltip(el: Element | HTMLElement);

	export function createTooltip(
		el: Element | HTMLElement,
		options?: PluginOptions['themes']['tooltip'],
		modifiers?: StrictModifiers
	);

	export const Dropdown = defineComponent({
		...PopperWrapper,
		name: 'VDropdown',
		vPopperTheme: 'dropdown',
	});
	export const Menu = defineComponent({
		...PopperWrapper,
		name: 'VMenu',
		vPopperTheme: 'menu',
	});
	export const Popper = defineComponent({
		props: {
			theme: {
				type: String,
				required: true,
			},

			targetNodes: {
				type: Function,
				required: true,
			},

			referenceNode: {
				type: Function,
				required: true,
			},

			popperNode: {
				type: Function,
				required: true,
			},

			arrowNode: {
				type: Function,
				default: null,
			},

			shown: {
				type: Boolean,
				default: false,
			},

			showGroup: {
				type: String,
				default: null,
			},

			// eslint-disable-next-line vue/require-prop-types
			ariaId: {
				default: null,
			},

			disabled: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'disabled');
				},
			},

			placement: {
				type: String,
				default(props) {
					return getDefaultConfig(props.theme, 'placement');
				},
				validator: value => placements.includes(value),
			},

			delay: {
				type: [String, Number, Object],
				default(props) {
					return getDefaultConfig(props.theme, 'delay');
				},
			},

			offset: {
				type: [Array, Function],
				default(props) {
					return getDefaultConfig(props.theme, 'offset');
				},
			},

			triggers: {
				type: Array,
				default(props) {
					return getDefaultConfig(props.theme, 'triggers');
				},
			},

			showTriggers: {
				type: [Array, Function],
				default(props) {
					return getDefaultConfig(props.theme, 'showTriggers');
				},
			},

			hideTriggers: {
				type: [Array, Function],
				default(props) {
					return getDefaultConfig(props.theme, 'hideTriggers');
				},
			},

			popperTriggers: {
				type: Array,
				default(props) {
					return getDefaultConfig(props.theme, 'popperTriggers');
				},
			},

			popperShowTriggers: {
				type: [Array, Function],
				default(props) {
					return getDefaultConfig(props.theme, 'popperShowTriggers');
				},
			},

			popperHideTriggers: {
				type: [Array, Function],
				default(props) {
					return getDefaultConfig(props.theme, 'popperHideTriggers');
				},
			},

			container: {
				type: [String, Object, Element, Boolean],
				default(props) {
					return getDefaultConfig(props.theme, 'container');
				},
			},

			boundary: {
				type: [String, Element],
				default(props) {
					return getDefaultConfig(props.theme, 'boundary');
				},
			},

			strategy: {
				type: String,
				validator: value => ['absolute', 'fixed'].includes(value),
				default(props) {
					return getDefaultConfig(props.theme, 'strategy');
				},
			},

			modifiers: {
				type: Array,
				default(props) {
					return getDefaultConfig(props.theme, 'modifiers');
				},
			},

			popperOptions: {
				type: Object,
				default(props) {
					return getDefaultConfig(props.theme, 'popperOptions');
				},
			},

			autoHide: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'autoHide');
				},
			},

			handleResize: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'handleResize');
				},
			},

			instantMove: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'instantMove');
				},
			},

			eagerMount: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'eagerMount');
				},
			},
		},

		emits: [
			'show',
			'hide',
			'update:shown',
			'apply-show',
			'apply-hide',
			'close-group',
			'close-directive',
			'auto-hide',
			'resize',
			'dispose',
		],
	});
	export const PopperContent = defineComponent({
		name: 'VPopperContent',

		components: {
			ResizeObserver,
		},

		mixins: [ThemeClass],

		props: {
			popperId: String,
			theme: String,
			shown: Boolean,
			mounted: Boolean,
			skipTransition: Boolean,
			autoHide: Boolean,
			handleResize: Boolean,
			classes: Object,
		},

		emits: ['hide', 'resize'],
	});
	export const PopperMethods = defineComponent({
		methods: {
			show(...args) {
				return this.$refs.popper.show(...args);
			},
			hide(...args) {
				return this.$refs.popper.hide(...args);
			},
			dispose(...args) {
				return this.$refs.popper.dispose(...args);
			},
			onResize(...args) {
				return this.$refs.popper.onResize(...args);
			},
		},
	});
	export const PopperWrapper = defineComponent({
		name: 'VPopperWrapper',

		components: {
			Popper: Popper(),
			PopperContent,
		},

		mixins: [PopperMethods, ThemeClass],

		inheritAttrs: false,

		props: {
			theme: {
				type: String,
				default: null,
			},
		},

		computed: {
			finalTheme() {
				return this.theme ?? this.$options.vPopperTheme;
			},
		},

		methods: {
			getTargetNodes() {
				const children = [...this.$refs.reference.children];
				return children.slice(0, children.length - 1).filter(Boolean);
			},
		},
	});
	export const ThemeClass = defineComponent({
		computed: {
			themeClass() {
				return getThemeClasses(this.theme);
			},
		},
	});
	export const Tooltip = defineComponent({
		...PopperWrapper,
		name: 'VTooltip',
		vPopperTheme: 'tooltip',
	});
	export const TooltipDirective = defineComponent({
		name: 'VTooltipDirective',

		components: {
			Popper: Popper(),
			PopperContent,
		},

		mixins: [PopperMethods],

		inheritAttrs: false,

		props: {
			theme: {
				type: String,
				default: 'tooltip',
			},

			html: {
				type: Boolean,
				default(props) {
					return getDefaultConfig(props.theme, 'html');
				},
			},

			content: {
				type: [String, Number, Function],
				default: null,
			},

			loadingContent: {
				type: String,
				default(props) {
					return getDefaultConfig(props.theme, 'loadingContent');
				},
			},
		},

		data() {
			return {
				asyncContent: null,
			};
		},

		computed: {
			isContentAsync() {
				return typeof this.content === 'function';
			},

			loading() {
				return this.isContentAsync && this.asyncContent == null;
			},

			finalContent() {
				if (this.isContentAsync) {
					return this.loading ? this.loadingContent : this.asyncContent;
				}
				return this.content;
			},
		},

		watch: {
			content: {
				handler() {
					this.fetchContent(true);
				},
				immediate: true,
			},

			finalContent(value) {
				this.$nextTick(() => {
					this.$refs.popper.onResize();
				});
			},
		},

		created() {
			this.$_fetchId = 0;
		},

		methods: {
			fetchContent(force) {
				if (
					typeof this.content === 'function' &&
					this.$_isShown &&
					(force || (!this.$_loading && this.asyncContent == null))
				) {
					this.asyncContent = null;
					this.$_loading = true;
					const fetchId = ++this.$_fetchId;
					const result = this.content(this);
					if (result.then) {
						result.then(res => this.onResult(fetchId, res));
					} else {
						this.onResult(fetchId, result);
					}
				}
			},

			onResult(fetchId, result) {
				if (fetchId !== this.$_fetchId) return;
				this.$_loading = false;
				this.asyncContent = result;
			},

			onShow() {
				this.$_isShown = true;
				this.fetchContent();
			},

			onHide() {
				this.$_isShown = false;
			},
		},
	});

	/* Vue plugin */

	export function install(app: App, options: PluginOptions = {}) {
		if (install.installed) return;
		install.installed = true;
		// Directive
		app.directive('tooltip', options);
		app.directive('close-popper', VClosePopper);
		// Components
		// eslint-disable-next-line vue/component-definition-name-casing
		app.component('v-tooltip', Tooltip);
		app.component('VTooltip', Tooltip);
		// eslint-disable-next-line vue/component-definition-name-casing
		app.component('v-dropdown', Dropdown);
		app.component('VDropdown', Dropdown);
		// eslint-disable-next-line vue/component-definition-name-casing
		app.component('v-menu', Menu);
		app.component('VMenu', Menu);
	}

	const plugin: {
		// eslint-disable-next-line no-undef
		version: string;
		install: typeof install;
		options: PluginOptions;
	};

	export default plugin;
}
