export type Film = { 
  title: string,
  criterionLink: string | undefined,
  image: string | undefined,
  review?: number | string | undefined,
  rottenLink?: string | undefined,
};

export type RottenFilm = {
  id: string,
  title: string,
  tomatoMeter: string,
  releaseDateTheaters: string,
}