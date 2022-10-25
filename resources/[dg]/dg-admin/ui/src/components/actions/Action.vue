<template>
  <DoAction :action="props.action" :active="props.action.toggled ?? false" @click="handleActionClick" can-favorite>
    <div class="menu-action-binds" v-show="props.action.bindable !== undefined" @click.stop>
      <q-select
        filled
        dense
        options-dense
        square
        bg-color="grey-7"
        :model-value="curBind"
        :options="binds"
        @update:model-value="handleBindSelection"
      />
    </div>
    <div :class="`menu-action-icon ${isOpen ? 'rotate-90' : ''}`" v-if="props.action.info !== undefined">
      <q-icon name="fa-solid fa-chevron-right" />
    </div>
  </DoAction>
  <div class="menu-action-inputs" v-show="isOpen" v-if="props?.action?.info">
    <AdminSelection
      v-for="(input, idx) in props.action?.info?.inputs ?? []"
      v-model="inputs[input]"
      :key="idx"
      :type="input"
    />
    <q-input
      v-for="(field, idx) in props.action?.info?.overrideFields ?? []"
      v-model="inputs[field]"
      :key="idx"
      :label="field"
      color="secondary"
      dense
      filled
    />
    <q-checkbox
      v-for="(box, idx) in props.action?.info?.checkBoxes ?? []"
      :key="idx"
      :label="box"
      v-model="inputs[box]"
      color="secondary"
      dense
      :style="{ width: '100%' }"
    />
    <q-btn color="primary" @click.prevent="dispatchAction">{{ props.action.title }}</q-btn>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeMount, reactive, ref } from 'vue';

  import { binds } from '@/lib/data';
  import { useStore } from '@/lib/store';

  import { nuiAction } from '../../lib/nui/action';
  import { Action } from '../../types/common';
  import AdminSelection from '../selectionInputs/AdminSelection.vue';

  import DoAction from './doAction.vue';

  const store = useStore();
  const props = defineProps<{ action: Action }>();
  const isOpen = ref(false);
  const inputs = reactive<Record<string, string | null>>({});
  const curBind = computed(() => store.getters.getBindForCmd(props.action.name));

  onBeforeMount(() => {
    if (!props.action.info) {
      return;
    }
    const keys = Object.keys(props.action.info) as (keyof Required<Action['info']>)[];
    if (!keys) return;
    for (const k of keys) {
      if (!props.action?.info?.[k]) {
        return;
      }
      ((props.action.info?.[k] ?? []) as string[]).forEach((v: string) => {
        inputs[v] = null;
      });
    }
  });

  const handleActionClick = () => {
    isOpen.value = !isOpen.value;
    if (props.action?.toggled === undefined) {
      if (!props.action?.info) {
        dispatchAction();
      }
      return;
    }
    store.dispatch('toggleAction', {
      name: props.action.name,
      toggled: !props.action.toggled,
    });
  };

  const handleBindSelection = (val: string) => {
    store.dispatch('assignBind', {
      name: props.action.name,
      bind: val,
    });
  };

  const dispatchAction = () => {
    nuiAction('doAction', {
      name: props.action.name,
      inputs: inputs,
    });
  };
</script>
