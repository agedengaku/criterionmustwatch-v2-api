import axios from 'axios';
import cheerio from 'cheerio';

const baseLeavingUrl = 'https://www.criterionchannel.com/leaving-';

function getLastDayOfTheCurrentMonth():string {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const lastDate = new Date(year, month, 0);
  
  return lastDate.toLocaleString('en-US', {month: 'long', day: 'numeric'})
    .toLowerCase()
    .replace(/ /g,"-");
}

function leavingUrl() {
  const lastDayDate = getLastDayOfTheCurrentMonth();
  
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
      console.error('oopsie');
    }
  } 

  return finalFilmList;
}

function resetFlags() {
  page = 1;
  hasMorePages = true;
}

async function scrapeFilms() {
  let filmList: { title: string, link: string | undefined, image: string | undefined }[] = [];
  try {
    const { data } = await axios.get(leavingUrl() + page);
    const $ = cheerio.load(data);
    const filmItems = $(".js-collection-item");

    filmItems.each((_:number, el:cheerio.Element) => {
      const film = assignValuesToFilm($, el);

      if (film) filmList.push(film);
    });

    // The site will have a "load more" button if there are more films to scrape
    hasMorePages = $('.js-load-more-link').length > 0 ? true: false;
  } catch (err) {
    hasMorePages = false;
    console.error('an error has occurred', err);
  }  

  return filmList;
}

function assignValuesToFilm($:cheerio.Root, el:cheerio.Element) {    
  const title = ($(el).find(".browse-item-title").find('strong').text()).trim();
  const link = $(el).find(".browse-item-title").find('a').attr('href');
  const image = $(el).find("img").attr('src');

  return { title, link, image };
}