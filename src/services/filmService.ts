import generateFilmData from './scraperService';
import type { Film } from '../types'; 
import fs from 'fs';
import path from 'path';

export async function getFilmData() {
  const filmCollection = await generateFilmData()
  console.log(await appendReviews(filmCollection));
  return filmCollection;
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
    return rottenTomatoesData.find((film: any) => film.title === 'Dum Mastam');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}