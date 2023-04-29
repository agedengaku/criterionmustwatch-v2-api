import generateFilmData from './scraperService';

export async function getFilmData() {
  return await generateFilmData();
}