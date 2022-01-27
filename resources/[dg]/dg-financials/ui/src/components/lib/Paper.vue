<template>
	<div
		:class="`paper ${imageOnly ? 'paper--imgonly' : ''} ${paperClass}`"
		@click="onClick"
		@mouseenter="setShowActions(true)"
		@mouseleave="setShowActions(false)"
	>
		<div v-if="$slots.image !== undefined" :class="`paper-image${imageOnly ? ' paper-image--ext' : ''}`">
			<slot name="image"></slot>
		</div>
		<div class="paper-details">
			<div v-if="$slots.title !== undefined" class="paper-details-title">
				<slot name="title"></slot>
			</div>
			<div v-if="$slots.description !== undefined" class="paper-details-description">
				<slot name="description"></slot>
			</div>
			<div v-if="$slots.extdescription !== undefined" class="paper-details-description--ext">
				<slot name="extdescription"></slot>
			</div>
			<div v-if="$slots.flex" class="paper-details-flex">
				<slot name="flex"></slot>
			</div>
		</div>
		<div v-if="showActions && actions.length > 0" class="paper-actionlist">
			<div
				v-for="action in actions"
				:key="action.label + action.icon"
				v-tooltip="action.label"
				class="paper-action"
				@click="action.handler(handlerArg[0])"
			>
				<Icon :icon="action.icon" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import '@/styles/os/paper.scss';
	import { defineComponent, onMounted, PropType, ref } from 'vue';
	import { Action } from '../../types/os';
	import { Icon } from '@iconify/vue';

	export default defineComponent({
		name: 'Paper',
		components: { Icon },
		props: {
			actions: {
				type: Array as PropType<Action<any>[]>,
				default: () => [],
			},
			handlerArg: {
				type: Array,
				default: () => [],
			},
			paperClass: {
				type: String,
				default: '',
			},
		},
		emits: ['onClick'],
		setup(_, { emit, slots }) {
			const showActions = ref(false);
			const imageOnly = ref(false);
			const setShowActions = (value: boolean) => {
				showActions.value = value;
			};
			const onClick = () => {
				emit('onClick');
			};
			onMounted(() => {
				if (slots.image && !slots.title && !slots.description && !slots.flex) {
					imageOnly.value = true;
				}
			});
			return {
				imageOnly,
				onClick,
				showActions,
				setShowActions,
			};
		},
	});
</script>
