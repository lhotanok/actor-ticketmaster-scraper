/* eslint-disable import/extensions */
import Apify from 'apify';

import { handleConcertsStartPage } from './src/concerts-start-page.js';
import { handleGenrePage } from './src/genre-page.js';

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();

    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
        countryCode: 'US',
    });

    // const puppeteerCrawler = new Apify.PuppeteerCrawler({
    //     requestList,
    //     requestQueue,
    //     proxyConfiguration,
    //     // launchContext: {
    //     //     useChrome: true,
    //     //     stealth: true,
    //     //     // launchOptions: {
    //     //     //     headless: false,
    //     //     // },
    //     // },
    //     handlePageFunction,
    // });

    const cheerioCrawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
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
        case 'GENRE':
            return handleGenrePage(context);
        default:
            return handleConcertsStartPage(context);
    }
}
