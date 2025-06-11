import { defineStore } from 'pinia';
import { ref } from 'vue';
import Cookies from 'js-cookie';
import { spotifyApi } from '../api/index';

export const usePlaybackStore = defineStore('playback', () => {
  const player = ref<any>(null);
  const deviceId = ref<string | null>(null);
  const currentlyPlayingUri = ref<string | null>(null);
  const position = ref(0);
  const duration = ref(0);
  const isPlaying = ref(false);

  // Store last known positions for each track URI
  const lastPositions: Record<string, number> = {};

  let positionTimer: number | null = null;

  function startPositionTimer() {
    if (positionTimer) return;
    positionTimer = window.setInterval(() => {
      if (isPlaying.value && position.value < duration.value) {
        position.value += 500;
      }
    }, 500);
  }

  function stopPositionTimer() {
    if (positionTimer) {
      clearInterval(positionTimer);
      positionTimer = null;
    }
  }

  function initializePlayer() {
    const token = Cookies.get('spotify_access_token');
    if (!token) return;

    const _player = new (window as any).Spotify.Player({
      name: 'ViteWebPlayer',
      getOAuthToken: (cb: (token: string) => void) => {
        const accessToken = Cookies.get('spotify_access_token');
        if (accessToken) cb(accessToken);
      },
      volume: 0.5
    });

    _player.addListener('initialization_error', ({ message }: any) => {
      console.error('[Spotify SDK] Initialization error:', message);
    });
    _player.addListener('authentication_error', ({ message }: any) => {
      console.error('[Spotify SDK] Authentication error:', message);
    });
    _player.addListener('account_error', ({ message }: any) => {
      console.error('[Spotify SDK] Account error:', message);
    });
    _player.addListener('playback_error', ({ message }: any) => {
      console.error('[Spotify SDK] Playback error:', message);
    });

    _player.addListener('player_state_changed', (state: any) => {
      console.log('[Spotify SDK] player_state_changed:', state);
      if (state) {
        position.value = state.position;
        duration.value = state.duration;
        isPlaying.value = !state.paused;
        if (!state.paused) {
          startPositionTimer();
        } else {
          stopPositionTimer();
        }
      }
    });

    _player.addListener('ready', ({ device_id }: any) => {
      console.log('[Spotify SDK] Ready with Device ID', device_id);
      deviceId.value = device_id;
    });

    _player.addListener('not_ready', ({ device_id }: any) => {
      console.log('[Spotify SDK] Device ID has gone offline', device_id);
    });

    _player.connect().then((success: boolean) => {
      console.log('[Spotify SDK] connect() returned', success);
      if (success) {
        console.log('[Spotify SDK] Successfully connected to Spotify!');
      } else {
        console.error('[Spotify SDK] Could not connect to Spotify');
      }
    });

    player.value = _player;
  }

  // Modified to accept positionMs
  async function playPreview(uri: string, positionMs = 0) {
    if (!uri || !deviceId.value) return;
    try {
      await spotifyApi.put('/me/player/pause?device_id=' + deviceId.value);

      await spotifyApi.put(
        `/me/player/play?device_id=${deviceId.value}`,
        {
          uris: [uri],
          position_ms: positionMs,
          offset: { position: 0 }
        }
      );

      if (player.value && player.value.resume) {
        await player.value.resume();
      }
      isPlaying.value = true;
      startPositionTimer();
    } catch (e) {
      console.error('[PlaybackStore] Error starting playback:', e);
    }
  }

  // Modified to store and resume last position
  async function togglePlayback(track: any) {
    if (currentlyPlayingUri.value === track.uri && isPlaying.value) {
      // Pause the current song and remember its position
      if (player.value && player.value.pause) {
        await player.value.pause();
      }
      lastPositions[track.uri] = position.value;
      isPlaying.value = false;
      stopPositionTimer();
      // Do NOT set currentlyPlayingUri to null
    } else {
      // If switching to a different song, clear the last position for the previous song
      if (currentlyPlayingUri.value && currentlyPlayingUri.value !== track.uri) {
        delete lastPositions[currentlyPlayingUri.value];
      }
      // Resume from last position if available, otherwise start from 0
      const resumePosition = lastPositions[track.uri] || 0;
      await playPreview(track.uri, resumePosition);
      currentlyPlayingUri.value = track.uri;
      isPlaying.value = true;
      startPositionTimer();
    }
  }

  function seek(positionMs: number) {
    if (player.value && player.value.seek) {
      player.value.seek(positionMs);
      position.value = positionMs;
      // Update last position for current track
      if (currentlyPlayingUri.value) {
        lastPositions[currentlyPlayingUri.value] = positionMs;
      }
    }
  }

  return {
    player,
    deviceId,
    currentlyPlayingUri,
    initializePlayer,
    playPreview,
    togglePlayback,
    seek,
    position,
    duration,
    isPlaying
  };
});