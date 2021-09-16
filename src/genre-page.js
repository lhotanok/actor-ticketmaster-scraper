import Apify from 'apify';

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

    const events = await getEvents(context);
    log.info(JSON.stringify(events));
}

async function getEvents(context) {
    if (context.$) return getEventsWithCheerio(context);
}

async function getEventsWithCheerio(context) {
    const { $ } = context;

    const headerSelector = '[data-tid=filtersPanel]+div .header';
    const titleSelector = '.event-tile__title:even';
    const placeSelector = '.event-tile__sub-title';

    const dateHeaderSelector = '[data-tid=filtersPanel]+div .event-listing__date';
    const dateSelector = `.event-tile__date-title`;
    const timeSelector = `.event-tile__sub-title`;

    const titles = getInnerTexts($, `${headerSelector} ${titleSelector}`);
    const places = getInnerTexts($, `${headerSelector} ${placeSelector}`);

    const dates = getInnerTexts($, `${dateHeaderSelector} ${dateSelector}`);
    const times = getInnerTexts($, `${dateHeaderSelector} ${timeSelector}`);

    log.info(`Event titles (${titles.length}): ${titles}`);
    log.info(`Event places (${places.length}): ${places}`);
    log.info(`Event dates (${dates.length}): ${dates}`);
    log.info(`Event times (${times.length}): ${times}`);

    const events = [];
    for (let i = 0; i < titles.length; i++) {
        events.push({
            title: titles[i],
            place: places[i],
            date: { ...parseDate(dates[i]), ...parseTime(times[i]) },
        });
    }

    return events;
}

function getInnerTexts($, selector) {
    return $(selector).toArray().map((el) => $(el).text());
}

function parseDate(date) {
    const parsedDate = {};

    if (date) {
        const fragments = date.split(' ');
        if (fragments) {
            [parsedDate.month, parsedDate.day] = [fragments[0], parseInt(fragments[1], 10)];
            if (fragments[2]) {
                parsedDate.year = parseInt(fragments[2], 10);
            }
        }
    }

    if (!parsedDate.year) parsedDate.year = new Date().getFullYear();

    return parsedDate;
}

function parseTime(time) {
    const parsedTime = {};

    if (time) {
        const fragments = time.split(' ');
        if (fragments) {
            [parsedTime.dayName, parsedTime.time] = [fragments[0], fragments[2]];
        }
    }

    return parsedTime;
}
