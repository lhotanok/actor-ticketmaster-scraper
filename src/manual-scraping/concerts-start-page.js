import Apify from 'apify';

// eslint-disable-next-line no-unused-vars
import Puppeteer from 'puppeteer';

// eslint-disable-next-line import/extensions
import { enqueueClassificationToScrape } from './request-queue-handler.js';

const { utils: { log } } = Apify;

export async function handleConcertsStartPage(context) {
    const { genres } = await Apify.getInput('genres');
    const lowerGenres = genres.map((genre) => genre.toLowerCase());

    const pageGenres = await getPageGenres(context);

    const filteredPageGenres = pageGenres.filter((genre) => {
        const lowerCaseGenre = genre.title.toLowerCase();
        const requested = lowerGenres.filter((reqGenre) => lowerCaseGenre.includes(reqGenre));

        return requested.length !== 0;
    });

    log.info(`Requested genres: ${JSON.stringify(genres, null, 2)}`);
    log.info(`Filtered genres: ${JSON.stringify(filteredPageGenres, null, 2)}`);

    await enqueueGenresToScrape(filteredPageGenres, context.crawler.requestQueue);
}

/**
 *
 * @param {Object} context
 * @returns {Promise<Object[{ id, title }]>} Extracted genres
 */
async function getPageGenres(context) {
    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

    let pageGenres;
    if (context.page) {
        log.info('Crawling with PuppeteerCrawler.');
        pageGenres = await getGenresWithPuppeteer(context.page, selector);
    } else if (context.$) {
        log.info('Crawling with CheerioCrawler.');
        pageGenres = await getGenresWithCheerio(context.$, selector);
    }

    return pageGenres;
}

/**
 *
 * @param {Puppeteer.Page} page
 * @param {String} selector Selector for genre elements targeting
 * @returns {Promise<Object[{ id, title }]>} Extracted genres
 */
async function getGenresWithPuppeteer(page, selector) {
    // extract genre id and title
    return page.$$eval(selector, (elements) => elements.map((el) => {
        return {
            id: el.getAttribute('value'),
            title: el.getAttribute('title'),
        };
    }));
}

/**
 *
 * @param {Object} $ Cheerio access object
 * @param {String} selector Selector for genre elements targeting
 * @returns {Promise<Object[{ id, title }]>} Extracted genres
 */
async function getGenresWithCheerio($, selector) {
    // extract genre id and title
    const genres = [];
    $(selector).each((_index, el) => {
        genres.push({
            id: $(el).attr('value'),
            title: $(el).attr('title'),
        });
    });

    return genres;
}

/**
 *
 * @param {Array} genres
 * @param {Apify.RequestQueue} requestQueue
 */
async function enqueueGenresToScrape(genres, requestQueue) {
    genres.forEach(async (genre) => {
        enqueueClassificationToScrape(requestQueue, 'concerts', genre);
    });
}
