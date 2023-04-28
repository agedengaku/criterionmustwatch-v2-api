import generateFilmData from './scraper';

export async function getFilmData() {
  return await generateFilmData();
}