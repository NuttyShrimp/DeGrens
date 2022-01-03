<!-- The <slot> tag is used to define act like props.children in this case -->
<template>
	<div :class="`appcontainer ${containerclass}`">
		<div
			class="topbar-wrapper"
			:style="{ 'min-height': primaryActions.length > 0 || auxActions.length > 0 || backbutton ? '3vh' : '0vh' }"
		>
			<div class="btn-wrapper">
				<div v-if="backbutton" class="backbtnWrapper" @click="$emit('back')">
					<i class="fas fa-chevron-left"></i>
				</div>
				<div v-if="primaryActions.length > 0 || auxActions.length > 0" class="actionsWrapper">
					<div v-for="action in primaryActions" :key="action" class="action">
						<div v-tooltip.bottom="action.label" @click="action.handler()">
							<i :class="`fas fa-${action.icon}`"></i>
						</div>
					</div>
					<div v-if="auxActions.length > 0">
						<el-dropdown trigger="click" size="small">
							<span class="action el-dropdown-link"><i class="fas fa-ellipsis-v"></i></span>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item
										v-for="action in auxActions"
										:key="action"
										class="action --dropdown"
										@click="action.handler()"
									>
										<div v-if="action.icon">
											<i :class="`fas fa-${action.icon}`"></i>
										</div>
										<div>
											{{ action.label }}
										</div>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</div>
			</div>
			<div v-if="search.list" class="topbar-search-input">
				<Input v-model="searchInput" :suffix-icon="Search" placeholder="Search" @input="doSearchFilter" />
			</div>
		</div>
		<div v-if="emptylist" class="appcontainer-emptylist">
			<div class="appcontainer-emptylist-icon">
				<i class="fas fa-frown"></i>
			</div>
			<div class="appcontainer-emptylist-text">Nothing to see here.</div>
		</div>
		<slot v-else></slot>
	</div>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import Input from './Inputs.vue';

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
			return {
				searchInput,
				doSearchFilter,
			};
		},
	});
</script>
