<template>
  <v-card rounded class="mb-4">
    <div class="image-container">
      <v-img
        height="300"
        width="300"
        :src="Image"
        cover
        class="bordered-img"
        style="border: 2px solid black;"
      ></v-img>
    </div>
    <v-divider></v-divider>

      <v-card-text class="pd-2 mar-0 ">
      <div class="text-subtitle-1" style="margin-bottom: 4px;">{{ Name }}</div>
      <div class="text-caption text-grey" style="font-size: 12px;">{{ Creator }}</div>
      </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const emit = defineEmits(
  ["play", "unLike"]
);

defineProps<{
  Name: string;
  Creator: string;
  Image: string;
}>();
</script>

<style scoped>
.image-container {
  position: relative;
}

.play-btn {
  font-size: 44px;
  width: 50px;
  height: 50px;
}

.unlike-btn {
  position: absolute;
  bottom: 10px;
  right: 0;
  transform: translateX(-50%);
}

.overlay-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .overlay-actions {
  opacity: 1;
}
</style>