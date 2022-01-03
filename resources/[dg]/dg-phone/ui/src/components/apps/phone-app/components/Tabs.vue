<template>
	<div class="phoneapp-tabs">
		<el-menu default-active="1" mode="horizontal" :ellipsis="false" @select="selectEvent">
			<el-menu-item v-for="(tab, i) in tabs" :key="tab.name" v-tooltip.bottom="tab.label" :index="String(i + 1)">
				<i :class="`fas fa-${tab.icon}`"></i>
			</el-menu-item>
		</el-menu>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
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
			const selectEvent = (key: number) => {
				emit('changetab', key);
			};
			return {
				selectEvent,
			};
		},
	});
</script>
