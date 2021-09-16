/* eslint-disable import/extensions */
import Apify from 'apify';

import { handleConcertsStartPage } from './src/concerts-start-page.js';
import { handleEventSearchPage } from './src/event-search-page.js';

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();

    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
        countryCode: 'US',
    });

    const pragueGeoHash = 'u2fk';

    const cheerioCrawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        preNavigationHooks: [
            async (_crawlingContext, requestAsBrowserOptions) => {
                requestAsBrowserOptions.headers = {
                    Cookie: `discovery_location={"geoHash":"${pragueGeoHash}"}`,
                };
            },
        ],
        handlePageFunction,
    });

    log.info('Starting the crawl.');

    await cheerioCrawler.run();
    // await puppeteerCrawler.run();

    log.info('Crawl finished.');
});

async function handlePageFunction(context) {
    const { url, userData: { label } } = context.request;
    log.info('Page opened.', { label, url });

    switch (label) {
        case 'EVENT_SEARCH':
            return handleEventSearchPage(context);
        default:
            return handleConcertsStartPage(context);
    }
}
