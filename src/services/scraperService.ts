import axios from 'axios';
import cheerio from 'cheerio';
import type { Film } from '../types';

const baseLeavingUrl = 'https://www.criterionchannel.com/leaving-';

function generateCurrentMonthLastDayDate():string {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const lastDate = new Date(year, month, 0);
  
  return lastDate.toLocaleString('en-US', {month: 'long', day: 'numeric'})
    .toLowerCase()
    .replace(/ /g,"-");
}

function leavingUrl() {
  const lastDayDate = generateCurrentMonthLastDayDate();
  
  return baseLeavingUrl + lastDayDate + '?page=';
}

let page = 1;
let hasMorePages = true;

export default async function generateFilmData() {
  const finalFilmList = [];

  resetFlags();

  while (hasMorePages) {
    try {
      const filmList = await scrapeFilms();
      finalFilmList.push(...filmList); 
      page++;
    } catch (err) {
      console.error('An error occurred while generating film data:', err);
    }
  } 

  return finalFilmList;
}

function resetFlags() {
  page = 1;
  hasMorePages = true;
}

async function scrapeFilms() {
  let filmList: Film[] = [];

  try {
    const { data } = await axios.get(leavingUrl() + page);
    const $ = cheerio.load(data);
    const filmItems = $(".js-collection-item");

    filmItems.each((_:number, el:cheerio.Element) => {
      const film = assignValuesToFilm($, el);

      if (film) filmList.push(film);
    });
    // The site will have a "load more" button if there are more films to scrape
    hasMorePages = $('.js-load-more-link').length > 0;
  } catch (err) {
    hasMorePages = false;
    console.error('An error has occurred scraping film list:', err);
  }  

  return filmList;
}

function assignValuesToFilm($:cheerio.Root, el:cheerio.Element) {    
  const title = ($(el).find(".browse-item-title").find('strong').text()).trim();
  const link = $(el).find(".browse-item-title").find('a').attr('href');
  const image = $(el).find("img").attr('src');

  return { title, link, image };
}