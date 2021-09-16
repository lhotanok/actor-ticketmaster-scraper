import Apify from 'apify';

const { utils: { log } } = Apify;

/**
 *
 * @param {Object} context
 * @param {Apify.Request} context.request
 */
export async function handleEventSearchPage(context) {
    const { request } = context;
    log.info(`Crawling events of category: ${request.userData.title}`);

    const events = await getEvents(context);
    log.info(JSON.stringify(events));
}

async function getEvents(context) {
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
            date: parseDate(dates[i], times[i]),
        });
    }

    return events;
}

function getInnerTexts($, selector) {
    return $(selector).toArray().map((el) => $(el).text());
}

function parseDate(date, detail) {
    const parsedDate = { ...parseDateDetail(detail) };

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

    const monthIndex = 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(parsedDate.month) / 3;
    const { year, day, hours, minutes } = parsedDate;
    if (monthIndex !== -1) parsedDate.dateObj = new Date(year, monthIndex, day, hours, minutes);

    return parsedDate;
}

function parseDateDetail(detail) {
    if (detail) {
        const fragments = detail.split(' ');
        if (fragments) {
            return {
                dayName: fragments[0],
                time: fragments[2],
                hours: parseInt(fragments[2], 10),
                minutes: parseInt(fragments[2].split(':')[1], 10),
            };
        }
    }

    return {};
}
