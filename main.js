/* eslint-disable import/extensions */
import Apify from 'apify';

import { getClassificationsToScrape } from './src/classifications-scraper.js';
import { handleCategorySearchPage } from './src/category-search-page.js';

const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();

    let categoryState = await Apify.getValue('CATEGORY_STATE') || {};
    Apify.events.on('persistState', async () => Apify.setValue('CATEGORY_STATE', categoryState));

    const categoryPagePrefix = 'https://www.ticketmaster.com/discover/';
    const categories = ['concerts', 'sports', 'arts-theater', 'family'];
    const categoryUrls = categories.map((category) => categoryPagePrefix + category);

    const requestQueue = await Apify.openRequestQueue();
    categoryUrls.forEach((categoryUrl) => {
        requestQueue.addRequest({ url: categoryUrl });
    });

    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
    });

    const categoriesCrawler = new Apify.CheerioCrawler({
        requestQueue,
        proxyConfiguration,
        handlePageFunction: async (context) => {
            const pageGenres = await handleCategorySearchPage(context, categoryState);
            categoryState = { ...categoryState, ...pageGenres };
        },
    });

    // const response = await requestAsBrowser({ url: 'https://www.ticketmaster.com/api/next/graphql?operationName=CategorySearch&variables={"countryCode":"CZ","locale":"en-us","sort":"date,asc","page":1,"size":10,"lineupImages":true,"withSeoEvents":true,"radius":"100","geoHash":"u2uc","unit":"miles","classificationId":["KnvZfZ7vAeA"],"localeStr":"en-us","type":"event","includeDateRange":true,"includeTBA":"yes","includeTBD":"yes"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"5664b981ff921ec078e3df377fd4623faaa6cd0aa2178e8bdfcba9b41303848b"}}' });

    // const jsonResponse = JSON.parse(htmlToText(response.body)); // body.toString
    // log.info(JSON.stringify(jsonResponse, null, 2));

    log.info('Starting the crawl.');
    await categoriesCrawler.run();
    log.info('Crawl finished.');

    log.info(`Category state:
    ${JSON.stringify(categoryState, null, 2)}`);

    const classifications = getClassificationsToScrape(input, categoryState);

    log.info(`Classifications will be scraped:
    ${JSON.stringify(classifications, null, 2)}`);
});
