/* eslint-disable import/extensions */
import Apify from 'apify';

import { getClassificationsToScrape } from './classifications-scraper.js';
import { scrapeCategories } from './category-search-page.js';
import { handleEventsSearchPage } from './events-search-page.js';
import { buildFetchRequest } from './request-builder.js';
import { REQUEST_TIMEOUT } from './consts.js';

const { utils: { log } } = Apify;

const CATEGORY_PAGE_PREFIX = 'https://www.ticketmaster.com/discover/';

Apify.main(async () => {
    const input = await Apify.getInput();

    const {
        maxItems,
        sortBy,
        countryCode, geoHash, distance,
        thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
    } = input;

    let categoryState = await Apify.getValue('CATEGORY_STATE') || {};
    Apify.events.on('persistState', async () => Apify.setValue('CATEGORY_STATE', categoryState));

    const categories = ['concerts', 'sports', 'arts-theater', 'family'];
    const categoryUrls = categories.map((category) => CATEGORY_PAGE_PREFIX + category);

    const requestQueue = await Apify.openRequestQueue();

    for (const categoryUrl of categoryUrls) {
        await requestQueue.addRequest({ url: categoryUrl });
    }

    // residential proxy is required due to Ticketmaster's strict blocking policy
    // datacenter proxies get blocked by default
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
    });

    const categoriesCrawler = new Apify.CheerioCrawler({
        requestQueue,
        proxyConfiguration,
        requestTimeoutSecs: REQUEST_TIMEOUT,
        handlePageFunction: async (context) => {
            const scrapedCategories = await scrapeCategories(context);
            categoryState = { ...categoryState, ...scrapedCategories };
        },
    });

    log.info('Starting categories crawl.');
    await categoriesCrawler.run();
    log.info('Categories crawl finished.');

    // whole input object passed as parameter as it contains large amount of bool properties representing classification IDs
    const classifications = getClassificationsToScrape(input, categoryState);

    const startRequest = buildFetchRequest({
        sortBy,
        countryCode,
        geoHash,
        distance,
        thisWeekendDate,
        dateFrom,
        dateTo,
        includeTBA,
        includeTBD,
    }, classifications);

    await requestQueue.addRequest(startRequest);

    const eventsCrawler = new Apify.CheerioCrawler({
        requestQueue,
        proxyConfiguration,
        requestTimeoutSecs: REQUEST_TIMEOUT,
        handlePageFunction: async (context) => handleEventsSearchPage(context, {
            maxItems,
            sortBy,
            countryCode,
            geoHash,
            distance,
            thisWeekendDate,
            dateFrom,
            dateTo,
            includeTBA,
            includeTBD,
        }),
    });

    log.info('Starting events crawl.');
    await eventsCrawler.run();
    log.info('Events crawl finished.');
});
