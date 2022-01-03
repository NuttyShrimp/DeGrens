<template>
	<div class="phoneapp-history-list">
		<paper
			v-for="entry in history"
			:key="(entry.name ?? entry.number ?? '') + entry.date"
			:actions="actions"
			:handler-arg="[entry]"
		>
			<template #image>
				<i :class="`fas fa-phone${entry.incoming ? '-alt' : ''}`"></i>
			</template>
			<template #title>{{ entry.name ?? entry.number ?? '' }}</template>
			<template #description>{{ formatRelativeTime(entry.date) }}</template>
		</paper>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
	import { CallHistoryEntry } from '../../../../types/apps';
	import Paper from '../../../os/Paper.vue';
	import { Action } from '../../../../types/appcontainer';
	import { formatRelativeTime } from '../../../../lib/util';
	import { getContact } from '../../contacts/lib';
	import { AddContactForm } from '../../contacts/components/ContactForm.vue';
	import { useStore } from '../../../../lib/state';
	import { startPhoneCall } from '../../../../lib/call';

	export default defineComponent({
		name: 'CallHistory',
		components: { Paper },
		props: {
			history: {
				type: Array as PropType<CallHistoryEntry[]>,
				required: true,
			},
		},
		setup() {
			const store = useStore();
			const actions: Action<CallHistoryEntry>[] = [
				{
					label: 'Bel terug',
					icon: 'phone',
					handler: e => {
						if (!e.number) return;
						startPhoneCall(e.number);
					},
				},
				{
					label: 'Toevoegen aan contacten',
					icon: 'user-plus',
					handler: e => {
						if (!e.number) return;
						if (getContact(e.number)) {
							store.dispatch('addNotification', {
								id: 'phoneapp-history-contact-exists',
								title: 'Phone',
								description: 'Contact bestaat al',
								icon: 'dialer',
							});
							return;
						}
						store.dispatch('openModal', {
							element: AddContactForm,
							props: {
								phone: e.number,
							},
						});
					},
				},
			];
			return {
				formatRelativeTime,
				actions,
			};
		},
	});
</script>
