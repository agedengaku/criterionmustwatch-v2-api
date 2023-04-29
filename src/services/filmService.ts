import generateFilmData from './scraperService';
import type { Film } from '../types'; 
import fs from 'fs';
import path from 'path';

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

function sortFilms(filmCollectionWithReviews: Film[]) {
  return filmCollectionWithReviews.sort((a, b) => {
    if (b.review === undefined
      || (typeof b.review === 'string' && isNaN(parseInt(b.review)))
    ) {
      b.review = -1;
    } else {
      if (typeof b.review === 'string') b.review = parseInt(b.review);
    }

    if (a.review === undefined
      || (typeof a.review === 'string' && isNaN(parseInt(a.review))))
    {
      a.review = -1;
    } else {
      if (typeof a.review === 'string') a.review = parseInt(a.review);
    }

    if (a.review > b.review) return -1;
    if (a.review < b.review) return 1;
    
    const titleA = a.title.replace(/^The /, '');
    const titleB = b.title.replace(/^The /, '');

    return titleA.localeCompare(titleB);
  });
}

async function appendReviews(filmCollection: Film[]) {
  try {
    const rottenTomatoesData = await getRottenTomatoesData();
    const filmCollectionWithReviews = filmCollection.map(film => {
      const matchedFilm = rottenTomatoesData.find((rottenFilm: any) => film.title === rottenFilm.title);

      if (matchedFilm) {
        film.review = matchedFilm.tomatoMeter;
        film.rottenLink = `m/${matchedFilm.id}`;
      }

      return film;
    });

    return sortFilms(filmCollectionWithReviews);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}