<template>
  <Target :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'Target'" />
  <Item :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'Item'" />
  <Vehicle :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'VehicleModel'" />
  <Instance :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'Instance'" />
  <BankAccounts :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'BankAccount'" />
  <WeatherType :modelValue="props.modelValue" @update:modelValue="updateValue" v-if="props.type === 'WeatherType'" />
  <WhitelistedJobs
    :modelValue="props.modelValue"
    @update:modelValue="updateValue"
    v-if="props.type === 'WhitelistedJobs'"
  />
</template>
<script setup lang="ts">
  import BankAccounts from './BankAccounts.vue';
  import Instance from './Instance.vue';
  import Item from './Item.vue';
  import Target from './Target.vue';
  import Vehicle from './Vehicle.vue';
  import WeatherType from './WeatherType.vue';
  import WhitelistedJobs from './WhitelistedJobs.vue';
  const props = defineProps<{
    modelValue: any;
    type: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
  }>();

  const updateValue = (val: any) => {
    emit('update:modelValue', val);
  };
</script>
