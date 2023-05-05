import generateFilmsCollection from './scraperService';
import type { Film, RottenFilm } from '../types'; 
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, '../../public', 'rotten_tomatoes_v2.json');

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
      const matchedFilmArray: RottenFilm[] = rottenTomatoesData.filter((rottenFilm: RottenFilm) => film.title === rottenFilm.title);

      if (matchedFilmArray.length > 1) {
        const matchedFilm = findCorrectFilm(matchedFilmArray, film.year);

        film.review = matchedFilm.tomatoMeter;
        film.rottenLink = `m/${matchedFilm.id}`;

        return film;
      }

      if (matchedFilmArray.length === 1) {
        const matchedFilm = matchedFilmArray[0];

        film.review = matchedFilm.tomatoMeter;
        film.rottenLink = `m/${matchedFilm.id}`;

        return film;
      }
      
      return film;
    });

    return sortFilms(filmsCollectionWithReviews);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function findCorrectFilm(rottenFilmArray: RottenFilm[], year: string | null)  {
  // First match the correct year.
  return matchYear(rottenFilmArray, year);
  // If there are multiple films with the same year or there is no match, match the correct director

  // If there is still no match, get the film with the oldest year
  // If there is are no years or all films have the same year, get the last one in the array
}

function matchYear(rottenFilmArray: RottenFilm[], year: string | null) {
  if (year) {
    const results = rottenFilmArray.filter((rottenFilmItem) => rottenFilmItem.releaseDateTheaters.substring(0, 4) === year)

    if (results.length === 1) {
      return results[0];
    }

    if (results.length === 0) {
      return rottenFilmArray[rottenFilmArray.length - 1];
    }

    if(results.length > 1) {
      return results[results.length - 1];
    }
  }

  return rottenFilmArray[rottenFilmArray.length - 1];  
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

function generateLeavingUrl() {
  const lastDayDate = generateCurrentMonthLastDayDate();
  
  return baseLeavingUrl + lastDayDate + '?page=';
}

export async function getSortedLeavingFilmsCollectionWithReviews() {
  const leavingUrl = generateLeavingUrl();
  const filmsCollection = await generateFilmsCollection(leavingUrl);

  return await appendReviews(filmsCollection);
}