import Apify from 'apify';
import { URL, URLSearchParams } from 'url';

/**
 *
 * @param {Array} genreIds
 * @param {Apify.RequestQueue} requestQueue
 */
export async function enqueueClassificationToScrape(requestQueue, categoryName, classification) {
    const url = new URL(`https://www.ticketmaster.com/discover/${categoryName}?`);

    // Ticketmaster API
    const queryParams = {
        classificationId: classification.id,

        // search filter
        sort: 'date%2Casc',
        radius: 300,
        unit: 'miles',
        daterange: 'all',
    };

    url.search = new URLSearchParams(queryParams);

    const request = new Apify.Request({
        url: url.toString(),
        userData: { label: 'EVENT_SEARCH', categoryName, classification },
    });

    await requestQueue.addRequest(request);
}
