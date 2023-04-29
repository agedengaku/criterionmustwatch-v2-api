import generateFilmData from './scraperService';
import type { Film } from '../types'; 
import fs from 'fs';
import path from 'path';
import { orderBy } from 'lodash';

export async function getFilmData() {
  const filmCollection = await generateFilmData();

  return await appendReviews(filmCollection);
}

const filePath = path.resolve(__dirname, '../../public', 'rotten_tomatoes.json');

async function getRottenTomatoesData() {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (error) {
    console.error('Error reading file:', error);

    return null;
  }
}

async function appendReviews(filmCollection: Film[]) {
  try {
    const rottenTomatoesData = await getRottenTomatoesData();

    filmCollection.forEach((film) => console.log(film.title));

    const filmCollectionWithReviews = filmCollection.map(film => {
      const matchedFilm = rottenTomatoesData.find((rottenFilm: any) => film.title === rottenFilm.title);

      if (matchedFilm) {
        film.review = parseInt(matchedFilm.tomatoMeter) || '';
        film.rottenLink = `m/${matchedFilm.id}`;
      }

      return film;
    });

    return orderBy(filmCollectionWithReviews, [ 'review', 'title' ], ['desc', 'asc']);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}