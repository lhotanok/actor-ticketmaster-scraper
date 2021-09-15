import Apify from 'apify';

// eslint-disable-next-line no-unused-vars
import Puppeteer from 'puppeteer';

const { utils: { log } } = Apify;
const { saveSnapshot } = Apify.utils.puppeteer;

/**
 *
 * @param {Object} context
 * @param {Puppeteer.Page} context.page
 * @param {Apify.Request} context.request
 */
export async function handleGenrePage({ page, request }) {
    log.info(`Crawling concerts of genre category: ${request.userData.title}`);
    await saveSnapshot(page, { key: `test-screen-${request.userData.id}` });
}
