<template>
  <v-app-bar color="green" dark>
    <v-toolbar-title class="d-flex align-center justify-center">
      <v-btn text class="mr-2" to="/home">Home</v-btn>
      <v-btn text to="/library">Library</v-btn>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-text-field
      v-model="search"
      placeholder="Search"
      hide-details
      dense
      solo-inverted
      prepend-inner-icon="mdi-magnify"
      class="search-input"
      @keyup.enter="goToSearch"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const search = ref('');
const router = useRouter();

const goToSearch = () => {
  const queryValue = search.value.trim();
  console.log('Search triggered with query:', queryValue); // Debugging
  if (queryValue) {
    router.push({ path: '/search', query: { q: queryValue } });
  } else {
    console.warn('Search query is empty.'); // Debugging
  }
};

</script>

<style scoped>
.search-input {
  max-width: 300px;
}
</style>