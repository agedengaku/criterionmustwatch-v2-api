import axios from 'axios';
import cheerio from 'cheerio';
import type { Film } from '../types';

function setFilmData($:cheerio.Root, el:cheerio.Element) {    
  const title = ($(el).find(".browse-item-title").find('strong').text()).trim().replace(/ \. \. \./g, '...');
  const criterionLink = $(el).find(".browse-item-title").find('a').attr('href');
  const image = $(el).find("img").attr('src');

  return { title, criterionLink, image };
}

async function scrapeFilms(url: string) {
  let filmList: Film[] = [];
  let hasMorePages = false;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const filmItems = $(".js-collection-item");

    filmItems.each((_:number, el:cheerio.Element) => {
      const film = setFilmData($, el);

      if (film) filmList.push(film);
    });
    // The site will have a "load more" button if there are more films to scrape
    hasMorePages = $('.js-load-more-link').length > 0;
  } catch (err) {
    console.error('An error has occurred scraping film list:', err);
    hasMorePages = false;
  }  

  return { filmList, hasMorePages };
}


export default async function generateFilmsCollection(url: string) {
  const finalFilmList = [];
  let pageNumber = 1;

  while (true) {
    try {
      const urlWithPageNumber = url + pageNumber;
      const { filmList, hasMorePages } = await scrapeFilms(urlWithPageNumber);
      
      finalFilmList.push(...filmList);

      if (!hasMorePages) break;

      pageNumber++;
    } catch (err) {
      console.error('An error occurred while generating film data:', err);
      break;
    }
  } 

  return finalFilmList;
}