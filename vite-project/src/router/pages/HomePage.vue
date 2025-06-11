<template>
  <Header />
  <v-main class="bg-#5D5D5D">
    <v-container style="max-width: 1200px;" class="homepage py-8">

      <h2 class="text-h5 text-white mb-1">Recently Played</h2>
      <v-slide-group show-arrows class="pa-2">
        <v-slide-group-item
            v-for="track in tracksStore.recentlyPlayedTracks"
            :key="track.id"
        >
          <TrackCard
            :Creator="track.artists[0].name"
            :CreatorId="track.artists[0].id"
            :Title="track.name"
            :Image="track.album.images[0].url"
            :liked="searchStore.likedTracks[track.id]"
            :uri="track.uri"
            @toggleLike="searchStore.toggleLike(track.id)"
          />
        </v-slide-group-item>
      </v-slide-group>

      <h2 class="text-h5 text-white mt-8 mb-1">Top Picks for You</h2>
      <v-slide-group show-arrows class="pa-2">
        <v-slide-group-item
            v-for="track in tracksStore.topTracks"
            :key="track.id"
        >
          <TrackCard
            :Creator="track.artists[0].name"
            :CreatorId="track.artists[0].id"
            :Title="track.name"
            :Image="track.album.images[0].url"
            :liked="searchStore.likedTracks[track.id]"
            :uri="track.uri"
            @toggleLike="searchStore.toggleLike(track.id)"
          />
        </v-slide-group-item>
      </v-slide-group>

    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import TrackCard from "../../components/TrackCard.vue";
import Header from "../../components/Header.vue";
import { useTracksStore } from '../../stores/track.ts';
import { useSearchStore  } from '../../stores/search.ts';
import { onMounted } from "vue";
import Cookies from "js-cookie";

const searchStore = useSearchStore();
const tracksStore = useTracksStore();

onMounted(async () => {
  const token = Cookies.get("spotify_access_token");
  if (!token) {
    console.warn("Waiting for token...");
    const waitForToken = async () => {
      while (!Cookies.get("spotify_access_token")) {
        await new Promise((r) => setTimeout(r, 100));
      }
    };
    await waitForToken();
  }

  try {
    await Promise.all([
      tracksStore.loadRecentlyPlayed(),
      tracksStore.loadTopTracks(),
    ]);

    const trackIds = [
      ...tracksStore.recentlyPlayedTracks.map(t => t.id),
      ...tracksStore.topTracks.map(t => t.id),
    ];
    await searchStore.loadLikedStatusForTracks(trackIds);

  } catch (err) {
    console.error("Error loading homepage data:", err);
  }
});
</script>


<style scoped>
.text-white {
  color: white;
}
.homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 150px;
  box-sizing: border-box;
}
</style>
