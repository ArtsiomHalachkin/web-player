export interface SpotifyUserProfile {
  display_name: string;
  email: string;
  id: string;
  images: Array<{ url: string }>;
  country: string;
  // Add more fields if needed
}
