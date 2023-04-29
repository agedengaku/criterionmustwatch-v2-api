export type Film = { 
  title: string,
  link: string | undefined,
  image: string | undefined
};

export type FilmWithReview = Film & {
  review: string | undefined;
};