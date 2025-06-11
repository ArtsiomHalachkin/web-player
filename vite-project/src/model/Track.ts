export interface Track {
  id: string;
  name: string;
  uri: string;
  artists: { name: string; id: string }[];
  album: { name: string; images: { url: string }[] };
}

