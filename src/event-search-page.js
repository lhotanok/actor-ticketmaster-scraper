import Apify from 'apify';

const { utils: { log } } = Apify;

/**
 *
 * @param {Object} context
 * @param {Apify.Request} context.request
 */
export async function handleEventSearchPage(context) {
    const { request } = context;

    log.info(`Crawling events of category: ${request.userData.categoryName}.`);
    log.info(`Classification: ${request.userData.classification.title}.`);

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

    const monthIndex = 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(parsedDate.month) / 3;
    if (!parsedDate.year && monthIndex !== -1) parsedDate.year = new Date().getFullYear();

    const { year, day, hours, minutes } = parsedDate;
    if (parsedDate.year) parsedDate.dateObj = new Date(year, monthIndex, day, hours, minutes);

    return parsedDate;
}

function parseDateDetail(detail) {
    if (detail) {
        const fragments = detail.split(' ');
        if (fragments) {
            const [dayName, time] = [fragments[0], fragments[2]];

            return {
                dayName,
                time,
                hours: parseHours(time),
                minutes: parseMinutes(time),
            };
        }
    }

    return {};
}

function parseHours(time) {
    let hours;

    if (time) {
        const hoursNumber = parseInt(time, 10);
        hours = time.includes('am') ? hoursNumber : hoursNumber + 12;
    }

    return hours;
}

function parseMinutes(time) {
    return time ? parseInt(time.split(':')[1], 10) : undefined;
}
