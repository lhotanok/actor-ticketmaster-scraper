import Apify from 'apify';
import { URL, URLSearchParams } from 'url';

// eslint-disable-next-line no-unused-vars
import Puppeteer from 'puppeteer';

const { utils: { log } } = Apify;

export async function handleConcertsStartPage({ page, crawler }) {
    const { genres } = await Apify.getInput('genres');
    const lowerGenres = genres.map((genre) => genre.toLowerCase());

    const pageGenres = await getGenres(page);

    const filteredPageGenres = pageGenres.filter((genre) => {
        const lowerCaseGenre = genre.title.toLowerCase();
        log.info(`LowerCase page genre: ${lowerCaseGenre}`);
        const requested = lowerGenres.filter((reqGenre) => {
            log.info(`Requested lower case genre: ${reqGenre}`);
            return lowerCaseGenre.includes(reqGenre);
        });

        return requested.length !== 0;
    });

    log.info(`Page genres: ${JSON.stringify(pageGenres)}`);
    log.info(`Requested genres: ${JSON.stringify(genres)}`);
    log.info(`Filtered genres: ${JSON.stringify(filteredPageGenres)}`);

    await enqueueGenresToScrape(filteredPageGenres, crawler.requestQueue);
}

/**
 *
 * @param {Puppeteer.Page} page
 */
async function getGenres(page) {
    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

    // extract genre id values
    return page.$$eval(selector, (elements) => elements.map((el) => {
        return {
            id: el.getAttribute('value'),
            title: el.getAttribute('title'),
        };
    }));
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
            radius: 100,
            sort: 'date%2Casc',
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
