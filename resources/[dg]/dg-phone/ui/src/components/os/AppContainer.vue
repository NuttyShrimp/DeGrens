<template>
	<div :class="`appcontainer ${containerclass}`">
		<div
			class="topbar-wrapper"
			:style="{ 'min-height': primaryActions.length > 0 || auxActions.length > 0 || backbutton ? '3vh' : '0vh' }"
		>
			<div class="btn-wrapper">
				<div v-if="backbutton && !(search.list || input?.name)" class="backbtnWrapper" @click="$emit('back')">
					<q-icon name="fas fa-chevron-left" size="xs" />
				</div>
				<div v-if="primaryActions.length > 0 || auxActions.length > 0" class="actionsWrapper">
					<div v-for="action in primaryActions" :key="action" class="action">
						<div v-tooltip.bottom="action.label" @click="action.handler()">
							<q-icon :name="`fas fa-${action.icon}`" size="xs" />
						</div>
					</div>
					<div v-if="auxActions.length > 0">
						<q-btn dense flat icon="fas fa-ellipsis-v" padding="none" size="sm">
							<q-menu>
								<q-list>
									<q-item
										v-for="action in auxActions"
										:key="action"
										v-close-popup
										v-ripple
										clickable
										dense
										class="action --dropdown"
										@click="action.handler()"
									>
										<q-item-section side>
											<q-icon v-if="action.icon" :name="`fas fa-${action.icon}`" size="xs" />
										</q-item-section>
										<q-item-section>
											{{ action.label }}
										</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
					</div>
				</div>
			</div>
			<div v-if="search.list || input?.name" class="topbar-search-input">
				<div v-if="backbutton" class="backbtnWrapper" @click="$emit('back')">
					<q-icon name="fas fa-chevron-left" size="xs" />
				</div>
				<div class="topbar-search-input--list">
					<Input v-if="search.list" v-model="searchInput" label="Search" @input="doSearchFilter">
						<template #prepend>
							<q-icon name="fas fa-search" size="xs" />
						</template>
					</Input>
					<Input
						v-if="input?.name"
						v-model="inputValue"
						:disabled="input.disabled"
						:label="input.label"
						@input="doInputChange"
					/>
				</div>
			</div>
		</div>
		<div v-if="emptylist" class="appcontainer-emptylist">
			<div class="appcontainer-emptylist-icon">
				<i class="fas fa-frown" />
			</div>
			<div class="appcontainer-emptylist-text">Nothing to see here.</div>
		</div>
		<slot v-else></slot>
	</div>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import Input from './Inputs';

	export default defineComponent({
		name: 'AppContainer',
		components: { Input },
		props: {
			search: {
				type: Object,
				default() {
					return {};
				},
			},
			input: {
				type: Object,
				default() {
					return {};
				},
			},
			primaryActions: {
				type: Array,
				default() {
					return [];
				},
			},
			auxActions: {
				type: Array,
				default() {
					return [];
				},
			},
			emptylist: {
				type: Boolean,
				default: false,
			},
			backbutton: {
				type: Boolean,
				default: false,
			},
			containerclass: {
				type: String,
				default() {
					return '';
				},
			},
		},
		emits: ['back'],
		setup(props) {
			const searchInput = ref('');
			const doSearchFilter = () => {
				const list = props.search.list.filter(item => {
					for (const field of props.search.filter) {
						const v = typeof field === 'function' ? field(item) : item[field];
						if (v && v.toString().toLowerCase().indexOf(searchInput.value.toLowerCase()) !== -1) {
							return true;
						}
					}
					return false;
				});
				props.search.onChange(list);
			};
			const inputValue = ref(props.input.value ?? '');
			const doInputChange = () => {
				props.input.onChange(inputValue.value);
			};
			return {
				searchInput,
				doSearchFilter,
				inputValue,
				doInputChange,
			};
		},
	});
</script>
