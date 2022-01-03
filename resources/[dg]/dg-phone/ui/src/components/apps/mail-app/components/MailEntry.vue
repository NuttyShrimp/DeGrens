<template>
	<div class="mail-entry" @click="toggleMail">
		<div class="mail-entry--wrapper">
			<div class="mail-entry--sender">Van: {{ mail.sender }}</div>
			<div class="mail-entry--subject">Onderwerp: {{ mail.sender }}</div>
			<div v-if="!mailExtended" class="mail-entry--message--small">{{ getFirstLine(mail.message) }}</div>
			<div v-else class="mail-entry--message" v-html="sanitizeText(mail.message)"></div>
		</div>
		<div class="mail-entry--date">{{ formatRelativeTime(mail.date) }}</div>
	</div>
</template>
<script lang="ts">
	import { defineComponent, PropType, ref } from 'vue';
	import { Mail } from '../../../../types/apps';
	import { formatRelativeTime, sanitizeText, getFirstLine } from '../../../../lib/util';

	export default defineComponent({
		name: 'MailEntry',
		props: {
			mail: {
				type: Object as PropType<Mail>,
				required: true,
			},
		},
		setup() {
			const mailExtended = ref(false);
			const toggleMail = () => {
				mailExtended.value = !mailExtended.value;
			};
			return {
				formatRelativeTime,
				mailExtended,
				toggleMail,
				sanitizeText,
				getFirstLine,
			};
		},
	});
</script>
