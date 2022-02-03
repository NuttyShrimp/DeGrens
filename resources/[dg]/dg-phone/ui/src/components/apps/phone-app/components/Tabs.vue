<template>
	<div class="phoneapp-tabs">
		<q-tabs v-model="tabRef" :stretch="true" :vertical="false" dense indicator-color="primary_light">
			<q-tab
				v-for="tab in tabs"
				:key="tab.name"
				v-tooltip.bottom="tab.label"
				:icon="`fas fa-${tab.icon}`"
				:name="tab.name"
			>
			</q-tab>
		</q-tabs>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, watch } from 'vue';
	import { TabEntry } from '../../../../types/apps';

	export default defineComponent({
		name: 'PhoneTabs',
		props: {
			activeTab: {
				type: String,
				default: 'history',
			},
			tabs: {
				type: Array as PropType<TabEntry[]>,
				default: () => [],
			},
		},
		emits: ['changetab'],
		setup(props, { emit }) {
			const tabRef = ref(props.activeTab);
			watch(tabRef, val => {
				emit('changetab', val);
			});
			return {
				tabRef,
			};
		},
	});
</script>
