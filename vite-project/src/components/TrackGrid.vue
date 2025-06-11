<template>
  <section class="mb-6">
    <h2 class="text-h6 mb-4 text-white">{{ title }}</h2>
    <v-row dense>
      <v-col v-for="n in 5" :key="n" cols="12" sm="4" md="2">
        <TrackCard
          :Creator="'Creator ' + n"
          :Title="'Title ' + n"
          :Image="'https://via.placeholder.com/150?text=Image+' + n"
        />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import TrackCard from './TrackCard.vue'
import { defineEmits } from 'vue';
const emit = defineEmits(
  ["unLike"]
);

defineProps<{ title: string }>()
</script>
