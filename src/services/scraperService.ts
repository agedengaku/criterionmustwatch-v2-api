import axios from 'axios';
import cheerio from 'cheerio';
import type { Film } from '../types';

function setFilmData($:cheerio.Root, el:cheerio.Element) {    
  const title = ($(el).find(".browse-item-title").find('strong').text()).trim().replace(/ \. \. \./g, '...');
  const criterionLink = $(el).find(".browse-item-title").find('a').attr('href');
  const image = $(el).find("img").attr('src');

  return { title, criterionLink, image };
}

function getDirectorAndYear(tooltipText: string) {  
  const regex = /Directed by (.+?) •/;
  const match = regex.exec(tooltipText);
  const director = match ? match[1].replace(/(, and|,|and) .*/, '') : null;

  const yearMatch = tooltipText.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : null;
  
  return { director, year }
}

async function scrapeFilms(url: string) {
  const filmList: Film[] = [];
  let hasMorePages = false;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const filmItems = $(".js-collection-item");

    filmItems.each((_:number, el:cheerio.Element) => {
      const filmId = $(el).attr('data-item-id');
      const tooltipText = $(`#collection-tooltip-${filmId}`).find('p').first().text();
      const { director, year } = getDirectorAndYear(tooltipText);
      console.log(tooltipText);
      console.log('\n');
      console.log(director);
      console.log(year);
      console.log('\n')
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
  const finalFilmList: Film[] = [];
  let pageNumber = 1;

  while (true) {
    try {
      const urlWithPageNumber = url + pageNumber;
      const { filmList, hasMorePages } = await scrapeFilms(urlWithPageNumber);
      
      finalFilmList.push(...filmList);

      if (!hasMorePages) break;
    } catch (err) {
      console.error('An error occurred while generating film data:', err);

      break;
    }

    pageNumber++;
  } 

  return finalFilmList;
}