import Apify from 'apify';

// eslint-disable-next-line no-unused-vars
import Puppeteer from 'puppeteer';

const { utils: { log } } = Apify;
const { saveSnapshot } = Apify.utils.puppeteer;

/**
 *
 * @param {Object} context
 * @param {Apify.Request} context.request
 */
export async function handleGenrePage(context) {
    const { request } = context;
    log.info(`Crawling concerts of genre category: ${request.userData.title}`);

    if (context.page) {
        log.info('Crawling with PuppeteerCrawler.');
        await saveSnapshot(context.page, { key: `test-screen-${request.userData.id}` });
    } else if (context.$) {
        log.info('Crawling with CheerioCrawler.');
    }
}
