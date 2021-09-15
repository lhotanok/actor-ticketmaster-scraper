import Apify from 'apify';
import { URL, URLSearchParams } from 'url';

// eslint-disable-next-line no-unused-vars
import Puppeteer from 'puppeteer';

const { utils: { log } } = Apify;

export async function handleConcertsStartPage(context) {
    const { genres } = await Apify.getInput('genres');
    const lowerGenres = genres.map((genre) => genre.toLowerCase());

    let pageGenres;
    if (context.page) {
        log.info('Crawling with PuppeteerCrawler.');
        pageGenres = await getGenresWithPuppeteer(context.page);
    } else if (context.$) {
        log.info('Crawling with CheerioCrawler.');
        pageGenres = await getGenresWithCheerio(context.$);
    }

    const filteredPageGenres = pageGenres.filter((genre) => {
        const lowerCaseGenre = genre.title.toLowerCase();
        const requested = lowerGenres.filter((reqGenre) => lowerCaseGenre.includes(reqGenre));

        return requested.length !== 0;
    });

    log.info(`Page genres: ${JSON.stringify(pageGenres)}`);
    log.info(`Requested genres: ${JSON.stringify(genres)}`);
    log.info(`Filtered genres: ${JSON.stringify(filteredPageGenres)}`);

    await enqueueGenresToScrape(filteredPageGenres, context.crawler.requestQueue);
}

/**
 *
 * @param {Puppeteer.Page} page
 * @returns {Promise<Object[{ id, title }]>} Extracted genres
 */
async function getGenresWithPuppeteer(page) {
    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

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
 * @param {Object} $ jQuery access object
 * @returns {Promise<Object[{ id, title }]>} Extracted genres
 */
async function getGenresWithCheerio($) {
    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

    // extract genre id and title
    const genres = [];
    $(selector).each((index, el) => {
        log.info(el);
        genres.push({
            id: $(el).attr('value'),
            title: $(el).attr('title'),
        });
    });

    return genres;
}

/**
 *
 * @param {Array} genreIds
 * @param {Apify.RequestQueue} requestQueue
 */
async function enqueueGenresToScrape(genres, requestQueue) {
    genres.forEach(async (genre) => {
        const { id, title } = genre;
        const url = new URL(`https://www.ticketmaster.com/discover/concerts?`);

        // Ticketmaster API
        const queryParams = {
            classificationId: id,

            // search filter
            sort: 'date%2Casc',
            radius: 100,
            unit: 'miles',
            daterange: 'all',
        };

        url.search = new URLSearchParams(queryParams);

        const genreRequest = new Apify.Request({
            url: url.toString(),
            userData: { label: 'GENRE', id, title },
        });

        await requestQueue.addRequest(genreRequest);
    });
}
