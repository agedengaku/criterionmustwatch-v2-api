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

function checkIfUndefinedOrEmpty(review: number | string | undefined) {
  if (review === undefined
    || (typeof review === 'string' && isNaN(parseInt(review)))
  ) {
    review = -1;
  } else {
    if (typeof review === 'string') review = parseInt(review);
  }  

  return review;
}

function sortFilms(filmCollectionWithReviews: Film[]) {
  return filmCollectionWithReviews.sort((a, b) => {
    // return -1 if the review is empty (no score) or undefined (not found on Rotten Tomatoes)
    b.review = checkIfUndefinedOrEmpty(b.review);
    a.review = checkIfUndefinedOrEmpty(a.review);

    // Sort by review score, descending order
    if (a.review > b.review) return -1;
    if (a.review < b.review) return 1;
    
    // If review scores are the same, sort by title
    // But remove "The " from the title before comparing them
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