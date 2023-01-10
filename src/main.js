import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

import { parseClassificationsToScrape } from './classifications-parser.js';
import { buildFetchRequest } from './request-builder.js';
import { REQUEST_TIMEOUT } from './consts.js';
import { categoriesRouter } from './routes/categories-crawler.js';
import { eventsRouter } from './routes/events-crawler.js';

await Actor.init();

const CATEGORY_PAGE_PREFIX = 'https://www.ticketmaster.com/discover/';

const input = await Actor.getInput();

const {
    maxItems,
    sortBy,
    countryCode, geoHash, distance,
    thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
} = input;

const categories = ['concerts', 'sports', 'arts-theater', 'family'];
const categoryUrls = categories.map((category) => CATEGORY_PAGE_PREFIX + category);

// residential proxy is required due to Ticketmaster's strict blocking policy
// datacenter proxies get blocked by default
const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

const categoriesCrawler = new CheerioCrawler({
    proxyConfiguration,
    requestHandlerTimeoutSecs: REQUEST_TIMEOUT,
    requestHandler: categoriesRouter,
});

const state = await categoriesCrawler.useState({
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
});

log.info('Starting categories crawl.');
await categoriesCrawler.run(categoryUrls);
log.info('Categories crawl finished.');

// whole input object passed as parameter as it contains large amount of bool properties representing classification IDs
const classifications = parseClassificationsToScrape(input, state);

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

const eventsCrawler = new CheerioCrawler({
    proxyConfiguration,
    requestHandlerTimeoutSecs: REQUEST_TIMEOUT,
    requestHandler: eventsRouter,
});

await eventsCrawler.useState(state);

log.info('Starting events crawl.');
await eventsCrawler.run([startRequest]);
log.info('Events crawl finished.');

await Actor.exit();
