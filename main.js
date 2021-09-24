/* eslint-disable import/extensions */
import Apify from 'apify';

import { getClassificationsToScrape } from './src/classifications-scraper.js';
import { handleCategorySearchPage } from './src/category-search-page.js';
import { handleEventsSearchPage } from './src/events-search-page.js';
import { buildFetchRequest } from './src/request-builder.js';

const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();

    const categoryState = await Apify.getValue('CATEGORY_STATE') || {};
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
            return handleCategorySearchPage(context, categoryState);
        },
    });

    const eventsCrawler = new Apify.CheerioCrawler({
        requestQueue,
        proxyConfiguration,
        handlePageFunction: async (context) => {
            return handleEventsSearchPage(context, input);
        },
    });

    log.info('Starting categories crawl.');
    await categoriesCrawler.run();
    log.info('Categories crawl finished.');

    const classifications = getClassificationsToScrape(input, categoryState);

    const startRequest = buildFetchRequest(input, classifications);
    requestQueue.addRequest(startRequest);

    log.info('Starting events crawl.');
    await eventsCrawler.run();
    log.info('Events crawl finished.');
});
