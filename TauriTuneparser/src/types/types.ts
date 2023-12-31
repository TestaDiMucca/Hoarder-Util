export type MediaRecord = {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  plays: number;
  dateAdded: string;
  year?: string;
  trackNo?: number;
  grouping?: string;
  hasVideo?: boolean;
};

export enum Graphs {
  genrePie = 'genrePie',
  genrePlays = 'genrePlays',
  genreArtists = 'genreArtists',
  addedTimeline = 'addedTimeline',
  groupingsPie = 'groupingsPie',
}

export enum GenrePieType {
  songs = 'songs',
  plays = 'plays',
  artists = 'artists',
}
