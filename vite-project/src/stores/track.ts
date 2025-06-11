import Cookies from "js-cookie";
import { defineStore } from "pinia";

import { spotifyApi, setBearerAuthToken } from "../api/index.ts";
import axios from "axios";
import { useAuthStore } from "./auth"; // importuj store
import { computed, reactive, ref } from "vue";
import type { Album }  from "../model/Album.ts";
import type { Track } from "../model/Track.ts";
import type { PlayList } from "../model/PlayList.ts";

export const useTracksStore = defineStore("tracks", () => {

  const savedPlaylists = ref<PlayList[]>([]);
  const savedAlbums = ref<Album[]>([]);
  const savedTracks = ref<Track[]>([]);

  
  const recentlyPlayedTracks = ref<Track[]>([]);
  const topTracks = ref<Track[]>([]);

  async function getTopTracks(): Promise<any[]> {
    const accessToken = Cookies.get("spotify_access_token");
    if (!accessToken) throw new Error("Access token is missing");
    setBearerAuthToken(accessToken);

    try {
      const response = await spotifyApi.get("/me/top/tracks?limit=10");
      console.log("Recently played response:", response.data);
      return response.data.items
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await useAuthStore().refreshAccessToken();
        const retry = await spotifyApi.get("/me/top/tracks?limit=10");
        return retry.data.items;
      } else {
        console.error("Failed to fetch recently played:", error);
        throw error;
      }
    }
  }

  async function loadTopTracks() {
    const data = await getTopTracks();
    topTracks.value.splice(0, topTracks.value.length, ...data);
    console.log("[Top Tracks]:", data);
  }


  async function getSavedTracks() {
    const accessToken = Cookies.get("spotify_access_token");
    if (!accessToken) throw new Error("Access token is missing");
    setBearerAuthToken(accessToken);

    try {
      const response = await spotifyApi.get("/me/tracks/?limit=8");
      const tracks: Track[] = response.data.items.map((item: any) => item.track);
      savedTracks.value.splice(0, savedTracks.value.length)
      savedTracks.value.push(...tracks)
      

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn("Access token expired, trying refresh...");
        await useAuthStore().refreshAccessToken();

        // Retry after refresh
        const response = await spotifyApi.get("/me/tracks/?limit=8");
        const tracks: Track[] = response.data.items.map((item: any) => item.track);
        savedTracks.value.splice(0, savedTracks.value.length)
        savedTracks.value.push(...tracks)
      } else {
        console.error("Top tracks error:", error);
        throw new Error("Failed to fetch Spotify Saved traks.");
      }
    }
  }

    async function getSavedAlbums() {
      const accessToken = Cookies.get("spotify_access_token");
      if (!accessToken) throw new Error("Access token is missing");
      setBearerAuthToken(accessToken);

      try {

        
        const response = await spotifyApi.get("/me/albums/?limit=20");
        const albums: Album[] = response.data.items.map((item: any) => item.album);
        savedAlbums.value.splice(0, savedAlbums.value.length)
        savedAlbums.value.push(...albums)

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.warn("Access token expired, trying refresh...");
          await useAuthStore().refreshAccessToken();

          // Retry after refresh
          const retryResponse = await spotifyApi.get("/me/tracks");
          console.log("Retry API response:", retryResponse);

          const response = await spotifyApi.get("/me/albums/?limit=20");
          savedAlbums.value.splice(0, savedAlbums.value.length)
          savedAlbums.value.push(...response.data.items)
          
        } else {
          console.error("Top tracks error:", error);
          throw new Error("Failed to fetch Spotify saved albums.");
        }
      }
    }





      async function deleteSavedAlbum(albumId: string):Promise<Number> {
        const accessToken = Cookies.get("spotify_access_token");
        if (!accessToken) throw new Error("Access token is missing");
        setBearerAuthToken(accessToken);
  
        try {
          const response = await spotifyApi.delete(`/me/albums?ids=${albumId}`);
  
          return response.status
  
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401 ) {
            console.warn("Access token expired, trying refresh...");
            await useAuthStore().refreshAccessToken();
            const retry = await spotifyApi.delete(`/me/albums?ids=${albumId}`);
            return retry.status;
            return retryResponse.data.items;
          } else {
            console.error("Delete tracks:", error);
            throw new Error("Failed to delete album.");
          }
        }
      }

      async function deleteSavedTrack(trackId: string):Promise<Number>  {
        const accessToken = Cookies.get("spotify_access_token");
        if (!accessToken) throw new Error("Access token is missing");
        setBearerAuthToken(accessToken);
  
        try {
          const response = await spotifyApi.delete(`/me/tracks?ids=${trackId}`);
  
          return response.status
  
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401 ) {
            console.warn("Access token expired, trying refresh...");
            await useAuthStore().refreshAccessToken();
  
            // Retry after refresh
            const retryResponse = await spotifyApi.get("/me/tracks");
            console.log("Retry API response:", retryResponse);
            return retryResponse.data.items;
          } else {
            console.error("Delete track:", error);
            throw new Error("Failed to delete track.");
          }
        }
        
      } 


    async function getRecentlyPlayed(): Promise<any[]> {
      const accessToken = Cookies.get("spotify_access_token");
      if (!accessToken) throw new Error("Access token is missing");
      setBearerAuthToken(accessToken);

      try {
        const response = await spotifyApi.get("/me/player/recently-played?limit=10");
        console.log("Recently played response:", response.data);
        return response.data.items.map((item: any) => item.track);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await useAuthStore().refreshAccessToken();

          const retryResponse = await spotifyApi.get("/me/player/recently-played?limit=10");
          return retryResponse.data.items.map((item: any) => item.track);
        } else {
          console.error("Failed to fetch recently played:", error);
          throw error;
        }
      }
    }

    async function loadRecentlyPlayed() {
      const data = await getRecentlyPlayed();
      recentlyPlayedTracks.value.splice(0, recentlyPlayedTracks.value.length, ...data);
    }


  /*
      async function getProfile(): Promise<SpotifyUserProfile> {
      const accessToken = Cookies.get("spotify_access_token");

      if (!accessToken) {
        throw new Error("Access token is missing");
      }else{
        setBearerAuthToken(accessToken);
      }

      try {
        const response = await spotifyApi.get<SpotifyUserProfile>("/me",)
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
        } else {
          console.error("Unexpected error:", error);
        }
        throw new Error("Failed to fetch Spotify profile.");
      }
    }
  */
    return {
      getTopTracks,
      deleteSavedAlbum,
      getSavedAlbums,
      getSavedTracks,
      savedAlbums,
      savedTracks,
      loadRecentlyPlayed,
      recentlyPlayedTracks,
      loadTopTracks,
      topTracks,
      deleteSavedTrack,
    }

  })


