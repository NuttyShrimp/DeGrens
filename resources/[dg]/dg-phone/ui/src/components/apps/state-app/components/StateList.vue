<template>
	<div class="state-list">
		<div class="state-list--header">
			<span>{{ title }}</span>
		</div>
		<q-separator />
		<div class="state-list--body">
			<div v-if="entries.length > 0">
				<div v-for="entry in entries" :key="entry.phone" class="state-list--entry">
					<div class="state-list--entry--name">
						<q-badge :color="entry.available ? 'green' : 'red'" rounded class="q-mr-sm" />
						<span>{{ entry.name }}</span>
					</div>
					<div class="state-list--entry--phone">
						<q-btn v-tooltip.left="'Bel'" size="sm" round flat icon="fas fa-phone" @click="startCall(entry)"> </q-btn>
					</div>
				</div>
			</div>
			<div v-else>
				<span>Er zijn momenteel geen actieve {{ title.toLowerCase() }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
	import { JusticePerson } from '../../../../types/apps';
	import { startPhoneCall } from '../../../../lib/call';

	export default defineComponent({
		name: 'StateList',
		props: {
			title: {
				type: String,
				required: true,
			},
			entries: {
				type: Array as PropType<JusticePerson[]>,
				required: true,
			},
		},
		setup(props) {
			const startCall = (entry: JusticePerson) => {
				startPhoneCall(entry.phone);
			};
			return {
				startCall,
			};
		},
	});
</script>
