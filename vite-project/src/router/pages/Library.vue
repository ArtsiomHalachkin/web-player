<template>
  <Header />
  <v-main class="bg-#5D5D5D">
    <v-container style="max-width: 1200px; " class="py-8">
      <div class="d-flex justify-center align-center mb-6 ">
        <h2
            class="text-h5 mr-8"
            :class="{ 'text-green': activeTab === 'likes', 'text-white': activeTab !== 'likes' }"
            @click="activeTab = 'likes'"
            style="cursor: pointer;"
        >
          Likes
        </h2>
        <h2
            class="text-h5 mr-8"
            :class="{ 'text-green': activeTab === 'albums', 'text-white': activeTab !== 'albums' }"
            @click="activeTab = 'albums'"
            style="cursor: pointer;"
        >
          Albums
        </h2>
      </div>

      <div v-if="activeTab === 'likes'" id="likes-view">
        <v-row dense>
          <v-col
              v-for="track in tracksStore.savedTracks"
              :key="track.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
          >
            <TrackCard
                id= "track-card"
                :Creator="track.artists[0].name"
                :CreatorId="track.artists[0].id"
                :Title="track.name"
                :Image="track.album.images[0].url"
                :liked="searchStore.likedTracks[track.id]"
                :uri="track.uri"
                @toggleLike="searchStore.toggleLike(track.id)"
                @unlike="handlUnlikeTrack(track.id)"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Albums View -->
      <div v-if="activeTab === 'albums'">
        <v-row dense>
          <v-col
              v-for="album in tracksStore.savedAlbums"
              :key="album.id"
              cols="12"
              sm="4"
              md="4"
              lg="3"
          >
            <AlbumCard
                :Name="album.name"
                :Creator="album.artists[0].name"
                :Image="album.images[0].url"
                @click="goToAlbum(album.id)"
                style="cursor: pointer;"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-main>
</template>



<script setup lang="ts">
import Header from "../../components/Header.vue";
import TrackCard from "../../components/TrackCard.vue";
import AlbumCard from '../../components/AlbumCard.vue';
import { useTracksStore } from '../../stores/track.ts';
import { useSearchStore } from '../../stores/search.ts';
import { onMounted, ref } from "vue";
import { useRouter } from 'vue-router';

const searchStore = useSearchStore();

const handlUnlikeTrack = async (trackId: string) => {
  try {
    await tracksStore.deleteSavedTrack(trackId);
    await tracksStore.getSavedTracks();
    // Reset likedTracks and update for new saved tracks
    searchStore.likedTracks = {};
    tracksStore.savedTracks.forEach(track => {
      searchStore.likedTracks[track.id] = true;
    });
  } catch (error) {
    console.error(`Error removing track with ID ${trackId}:`, error);
  }
};

const activeTab = ref<'likes' | 'albums' | 'playlists'>('likes');
const tracksStore = useTracksStore();
const router = useRouter();

function goToAlbum(albumId: string) {
  router.push({ name: 'album', params: { id: albumId } });
}

onMounted(async () => {
  try {
    await tracksStore.getSavedTracks();
    await tracksStore.getSavedAlbums();
    tracksStore.savedTracks.forEach(track => {
      searchStore.likedTracks[track.id] = true;
    });
  } catch (error) {
    console.error("Error fetching:", error);
  }
});
</script>



<style scoped>
.text-green {
  color: #4caf50;
}
.text-white {
  color: #ffffff;
}
</style>