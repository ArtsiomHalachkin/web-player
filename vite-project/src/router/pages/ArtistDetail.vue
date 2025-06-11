<template>
  <v-container class="py-10" style="max-width: 1000px;">
    <v-app-bar color="green" dark>
      <v-btn variant="text" class="me-2" @click="goBack">&lt; </v-btn>
      <v-btn to="/home" variant="tonal" class="me-2">Home</v-btn>
      <v-btn to="/library" variant="tonal">Library</v-btn>
    </v-app-bar>

    <div class="mt-16" id="artist-detail" v-if="artistStore.artist && artistStore.artist.name">
      <v-card class="pa-6 mb-8" style="background-color: #1e1e1e;">
        <v-row>
          <v-col cols="4">
            <v-img
              id ="artist-image"
              v-if="artistStore.artist.images?.length"
              :src="artistStore.artist.images[0].url"
              height="200"
              width="200"
              contain
            />
            <div
              v-else
              class="bg-grey-light"
              style="height:200px;width:200px;"
            ></div>
          </v-col>
          <v-col cols="8">
            <div class="text-h4 text-white mb-2">{{ artistStore.artist.name }}</div>
            <div class="text-caption text-grey mb-4"  id ="artist-followers">
              {{ artistStore.artist.followers?.total?.toLocaleString() ?? '0' }} followers
            </div>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="pa-6 mb-8" style="background-color: #1e1e1e;">
        <div class="text-subtitle-1 text-white mb-2">Basic info</div>
        <div class="text-body-2 text-grey">
          {{ artistStore.artist.genres?.length
            ? artistStore.artist.genres.join(', ')
            : 'No genres available.' }}
        </div>
      </v-card>

      <h2 class="text-h6 mb-4 text-white">More from the same Artist</h2>
      <v-slide-group show-arrows v-if="artistStore.topTracks.length">
        <v-slide-group-item
          v-for="track in artistStore.topTracks"
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
                @unlike="handlUnlikeTrack(track.id)"
            />
        </v-slide-group-item>
      </v-slide-group>
      
      <h2 class="text-h6 mt-10 mb-4">{{ artistStore.artist.name }}’s Top Albums</h2>
      <v-slide-group class="album-carousel-wrapper" show-arrows v-if="searchStore.topAlbums.length">
        <v-slide-group-item
          v-for="album in searchStore.topAlbums"
          :key="album.id"
        >
          <router-link
            :to="{ name: 'album', params: { id: album.id } }"
            style="text-decoration: none;"
          >
            <v-card class="mx-2 album-card" width="200" elevation="2">
              <v-img :src="album.images[0]?.url" height="200px" />
              <v-card-title class="text-sm text-white">{{ album.name }}</v-card-title>
              <v-card-subtitle class="text-xs text-grey px-3 pb-2">
                <span
                  v-for="(artist, idx) in album.artists"
                  :key="artist.id"
                >
                  <router-link
                    :to="{ name: 'artist', params: { id: artist.id } }"
                    class="artist-link text-grey"
                  >{{ artist.name }}</router-link
                  ><span v-if="idx < album.artists.length - 1">, </span>
                </span>
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-slide-group-item>
      </v-slide-group>
    </div>
    
    <div v-else class="text-center py-10 text-grey">
      Loading artist details…
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArtistStore } from '../../stores/artist';
import { useSearchStore } from '../../stores/search';
import TrackCard from '../../components/TrackCard.vue';
import { useTracksStore } from '../../stores/track';

const route = useRoute();
const router = useRouter();
const artistStore = useArtistStore();
const searchStore = useSearchStore();
const tracksStore = useTracksStore();

const handlUnlikeTrack = (trackId: string) => {
  tracksStore.deleteSavedTrack(trackId).then(() => {
    tracksStore.getSavedTracks();
  }).catch((error) => {
    console.error(`Error removing track with ID ${trackId}:`, error);
  });
};

onMounted(() => {
  const artistId = route.params.id as string;
  artistStore.fetchArtist(artistId);
  searchStore.fetchTopAlbums(artistId);
});

watch(() => route.params.id, (id) => {
  if (id) {
    artistStore.fetchArtist(id as string);
    searchStore.fetchTopAlbums(id as string);
  }
});

function goBack() {
  router.back();
}
</script>