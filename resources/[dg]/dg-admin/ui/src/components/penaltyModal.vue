<template>
  <q-dialog :model-value="shouldShow" @update:model-value="store.commit('penalty/setVisible', false)">
    <q-card style="width: 50vh">
      <q-card-section>
        <div class="text-h6">Penalise a player</div>
      </q-card-section>

      <q-card-section class="q-pt-none" v-if="banTarget">
        Target: {{ banTarget.name }} ({{ banTarget.steamId }} | {{ banTarget.serverId }})
      </q-card-section>
      <q-card-section class="q-pt-none" v-else style="color: red"> Target: NOT FOUND</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-select
          filled
          dense
          options-dense
          use-input
          multiple
          use-chips
          stack-label
          label="Reden"
          color="secondary"
          input-debounce="0"
          :model-value="reasons"
          :options="Object.keys(banReasons)"
          @update:model-value="setReason"
        >
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section :no-wrap="false"> {{ scope.opt }} ({{ banReasons[scope.opt] }})</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model.model="penaltyPoints"
          filled
          dense
          color="secondary"
          type="number"
          :rules="[val => val >= 0 || 'Aantal punten kan niet negatief zijn']"
        >
          <template #append> punten</template>
        </q-input>
        <q-input
          v-model.model="banLength"
          filled
          dense
          color="secondary"
          type="number"
          :rules="[val => val >= -1 || 'Lengte kan niet korter dan -1 zijn']"
        >
          <template #append> dagen</template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn unelevated label="Cancel" v-close-popup />
        <q-btn unelevated label="Warn" color="warning" @click="warnPlayer" />
        <q-btn unelevated label="Kick" color="deep-orange" @click="kickPlayer" />
        <q-btn unelevated label="Ban" color="negative" @click="banPlayer" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { nuiAction } from '../lib/nui/action';
  import { useStore } from '../lib/store';

  const store = useStore();
  const reasons = ref<string[]>([]);
  const penaltyPoints = ref(0);
  const banLength = ref(0);
  const shouldShow = computed(() => store.state.penalty?.visible ?? false);
  const banTarget = computed(() => store.state.penalty?.currentTarget ?? null);
  const banReasons = computed(() => store.state.penalty?.reasons ?? {});
  const banClasses = computed(() => store.state.penalty?.classes ?? {});

  const warnPlayer = () => {
    if (!reasons.value || reasons.value.length === 0) {
      return;
    }
    if (penaltyPoints.value < 0) return;
    nuiAction('penalisePlayer', {
      type: 'warn',
      target: banTarget.value?.steamId,
      reasons: reasons.value,
    });
    store.commit('penalty/setVisible', false);
  };

  const kickPlayer = () => {
    if (!reasons.value || reasons.value.length === 0) {
      return;
    }
    if (penaltyPoints.value < 0) return;
    nuiAction('penalisePlayer', {
      type: 'kick',
      target: banTarget.value?.steamId,
      reasons: reasons.value,
      points: penaltyPoints.value,
    });
    store.commit('penalty/setVisible', false);
  };

  const banPlayer = () => {
    if (!reasons.value || reasons.value.length === 0) {
      return;
    }
    if (penaltyPoints.value < 0) return;
    if (banLength.value <= -1) return;
    nuiAction('penalisePlayer', {
      type: 'ban',
      target: banTarget.value?.steamId,
      reasons: reasons.value,
      points: penaltyPoints.value,
      length: banLength.value,
    });
    store.commit('penalty/setVisible', false);
  };

  const setReason = (val: string[]) => {
    reasons.value = val;
    penaltyPoints.value = 0;
    banLength.value = 0;
    val.forEach(val => {
      if (banReasons.value[val]) {
        const banClass = banReasons.value[val];
        penaltyPoints.value += banClasses.value[banClass].points;
        banLength.value += banClasses.value[banClass].length;
      }
    });
  };
</script>
