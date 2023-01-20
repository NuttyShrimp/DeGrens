<template>
  <q-select
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    :options="options"
    :input-debounce="0"
    :label="props.label"
    menu-anchor="bottom left"
    color="secondary"
    dense
    options-dense
    use-input
    filled
    @filter="filterFn"
  >
    <template #selected>
      <slot name="selected" />
    </template>
    <template #option="scope">
      <slot name="option" v-bind="scope" />
    </template>
  </q-select>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    modelValue: any;
    options: any[];
    label: string;
    filterKeys: string[];
  }>();
  const options = ref(props.options);

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
  }>();

  const updateValue = (val: any) => {
    emit('update:modelValue', val);
  };

  const filterFn = (val: string, update: Function) => {
    update(() => {
      const needle = val.toLowerCase();
      options.value = props.options.filter(v => {
        // We concat all values from the filterkeys to search
        const fullIdentifier = props.filterKeys.reduce((acc, cur) => `${acc}${v[cur]}`, '');
        return fullIdentifier.toLowerCase().indexOf(needle) > -1;
      });
    });
  };
</script>
