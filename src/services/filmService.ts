import generateFilmsCollection from './scraperService';
import type { Film, RottenFilm } from '../types'; 
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, '../../public', 'rotten_tomatoes.json');

async function getRottenTomatoesData() {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');

    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file:', error);

    return null;
  }
}

function checkIfUndefinedOrEmpty(review: number | string | undefined) {
  if (review === undefined || (typeof review === 'string' && isNaN(parseInt(review)))) review = -1;
  else if (typeof review === 'string') review = parseInt(review);  

  return review;
}

function sortFilms(filmsCollectionWithReviews: Film[]) {
  return filmsCollectionWithReviews.sort((a, b) => {
    // return -1 if the review is empty (no score) or undefined (not found on Rotten Tomatoes)
    b.review = checkIfUndefinedOrEmpty(b.review);
    a.review = checkIfUndefinedOrEmpty(a.review);

    // Sort by review score, descending order
    if (a.review > b.review) return -1;
    if (a.review < b.review) return 1;
    
    // If review scores are the same, remove "The " from the title...
    const titleA = a.title.replace(/^The /, '');
    const titleB = b.title.replace(/^The /, '');

    // ...before sorting them by title in alphabetical order
    return titleA.localeCompare(titleB);
  });
}

async function appendReviews(filmsCollection: Film[]) {
  try {
    const rottenTomatoesData = await getRottenTomatoesData();
    const filmsCollectionWithReviews = filmsCollection.map(film => {
      const matchedFilm = rottenTomatoesData.find((rottenFilm: RottenFilm) => film.title === rottenFilm.title);

      if (matchedFilm) {
        film.review = matchedFilm.tomatoMeter;
        film.rottenLink = `m/${matchedFilm.id}`;
      }

      return film;
    });

    return sortFilms(filmsCollectionWithReviews);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function generateCurrentMonthLastDayDate() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const lastDate = new Date(year, month, 0);
  
  return lastDate.toLocaleString('en-US', {month: 'long', day: 'numeric'})
    .toLowerCase()
    .replace(/ /g,"-");
}

const baseLeavingUrl = 'https://www.criterionchannel.com/leaving-';

function leavingUrl() {
  const lastDayDate = generateCurrentMonthLastDayDate();
  
  return baseLeavingUrl + lastDayDate + '?page=';
}

export async function getSortedLeavingFilmsCollectionWithReviews() {
  const filmsCollection = await generateFilmsCollection(leavingUrl());

  return await appendReviews(filmsCollection);
}