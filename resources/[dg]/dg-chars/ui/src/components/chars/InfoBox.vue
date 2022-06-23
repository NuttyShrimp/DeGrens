<template>
  <div class="selector-info" :style="{ ...loc, ...(isPosFrozen ? { padding: '0' } : {}) }">
    <div v-if="(currentCharacter?.citizenid ?? 0) !== 1">
      <div v-if="!isPosFrozen" class="selector-info--title">
        <span>{{ currentCharacter?.name ?? '' }}</span>
      </div>
      <div v-else>
        <q-list dense separator>
          <q-item v-ripple clickable @click.stop="spawn">
            <q-item-section side>
              <q-icon name="fas fa-map" size="sm" color="white" />
            </q-item-section>
            <q-item-section> Spawn </q-item-section>
          </q-item>
          <q-item v-ripple clickable @click.stop="deleteChar">
            <q-item-section side>
              <q-icon name="fas fa-times" size="sm" color="red" />
            </q-item-section>
            <q-item-section> Delete </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <div v-else>
      <div v-if="!isPosFrozen" class="selector-info--title">
        <span>Nieuw karakter</span>
      </div>
      <div v-else>
        <q-list dense separator>
          <q-item v-ripple clickable @click.stop="createChar">
            <q-item-section side>
              <q-icon name="fas fa-map" size="sm" color="white" />
            </q-item-section>
            <q-item-section> Create </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Weet je zeker dat je je karakter wilt verwijderen? Dit kan niet ongedaan gemaakt
            worden!</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup label="Delete" color="primary" @click.prevent="confirmDelete" />
          <q-btn v-close-popup label="Cancel" color="secondary" @click.prevent="unFreeze" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="createDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nieuw karakter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="charInfo.firstname" dense label="Voornaam" autofocus :rules="validationRules" />
          <q-input v-model="charInfo.lastname" dense label="Achternaam" autofocus :rules="validationRules" />
          <q-input v-model="charInfo.nationality" dense label="Nationaliteit" autofocus
            :rules="[val => !!val || 'Field is required']" />
          <div class="q-gutter-sm">
            <q-radio v-model="charInfo.gender" :val="0" label="Man" />
            <q-radio v-model="charInfo.gender" :val="1" label="Vrouw" />
          </div>
          <q-input v-model="charInfo.birthdate" filled label="Geboortedatum" mask="date" :rules="['date']">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="charInfo.birthdate" minimal :options="dobLimit">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup label="Create" color="primary" @click.prevent="confirmCreate" />
          <q-btn v-close-popup label="Cancel" color="secondary" @click.prevent="unFreeze" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';

import { nuiAction } from '../../lib/nui/action';
import { useStore } from '../../lib/store';
const fillWithZero = (num: number) => {
  if (num <= 9) return "0" + num;
  return num
}
export default defineComponent({
  name: 'InfoBox',
  props: {
    loc: {
      type: Object,
      default: () => ({ top: 0, left: 0 }),
    },
  },
  setup() {
    const today18Date = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000);
    const today18 =
      `${today18Date.getFullYear()}/${fillWithZero(today18Date.getMonth() + 1)}/${fillWithZero(today18Date.getDate())}`;
    const store = useStore();
    const currentCharacter = computed(() => store.state.currentCharacter);
    const isPosFrozen = computed(() => store.state.freezePosition);
    const deleteDialog = ref(false);
    const createDialog = ref(false);
    const charInfo = reactive({
      firstname: '',
      lastname: '',
      nationality: 'Belg',
      birthdate: today18,
      gender: 0,
    });

    const dobLimit = (date: string) => {
      // Smaller or eq to today18
      return date <= today18;
    };

    const spawn = () => {
      nuiAction('selectChar');
    };

    const deleteChar = () => {
      deleteDialog.value = true;
    };

    const confirmDelete = () => {
      deleteDialog.value = false;
      nuiAction('deleteChar');
    };

    const createChar = () => {
      createDialog.value = true;
    };

    const confirmCreate = () => {
      createDialog.value = false;
      nuiAction('createChar', charInfo);
    };

    const unFreeze = () => {
      store.commit('setFreezePosition', false);
    };

    return {
      currentCharacter,
      isPosFrozen,
      spawn,
      deleteChar,
      createChar,
      confirmDelete,
      confirmCreate,
      unFreeze,
      deleteDialog,
      createDialog,
      charInfo,
      dobLimit,
      validationRules: [
        (val: string) => !!val || '* Verplicht',
        (val: string) => val.length > 2 || 'Je naam moet minstens 3 karakters lang zijn',
      ]
    };
  },
});
</script>
