import Apify from 'apify';

const { utils: { log } } = Apify;

/**
 *
 * @param {Object} context
 * @param {Apify.Request} context.request
 */
export async function handleEventSearchPage(context) {
    const { request } = context;
    const { userData: { categoryName, classification } } = request;

    log.info(`Crawling events of category: ${categoryName}.
    Classification: ${classification.title}.`);

    const events = await getEvents(context);
    events.forEach((event) => {
        event.category = categoryName;
        event.classification = classification;
    });

    log.info(`Events:
    ${JSON.stringify(events, null, 2)}`);
}

async function getEvents(context) {
    const itemsSelector = '.event-listing .event-listing__item';

    const headerSelector = '.header';
    const titleSelector = `${headerSelector} .event-tile__title:even`;
    const placeSelector = `${headerSelector} .event-tile__sub-title`;

    const dateHeaderSelector = '.event-listing__date';
    const dateSelector = `${dateHeaderSelector} .event-tile__date-title`;
    const dateDetailSelector = `${dateHeaderSelector} .event-tile__sub-title`;

    let events = [];
    if (context.$) {
        const { $ } = context;
        const selectors = { itemsSelector, titleSelector, placeSelector, dateSelector, dateDetailSelector };
        events = getEventsWithCheerio($, selectors);
    }

    return events;
}

function getEventsWithCheerio($, selectors) {
    const { itemsSelector, titleSelector, placeSelector, dateSelector, dateDetailSelector } = selectors;

    const items = $(itemsSelector);

    const events = [];
    items.each((_index, item) => {
        events.push({
            title: $(item).find(titleSelector).text(),
            place: $(item).find(placeSelector).text(),
            date: parseDate({
                date: $(item).find(dateSelector).text(),
                detail: $(item).find(dateDetailSelector).text(),
            }),
        });
    });

    return events;
}

/**
 *
 * @param {Object} date
 * @param {String} date.date
 * @param {String} date.detail
 * @returns
 */
function parseDate({ date, detail }) {
    const parsedDate = {
        year: NaN,
        month: null,
        day: NaN,
        ...parseDateDetail(detail),
        full: null,
    };

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
    if (parsedDate.year) parsedDate.full = parseFullDate([year, monthIndex, day, hours, minutes]).toLocaleString();

    return parsedDate;
}

/**
 *
 * @param {String} detail Date detail. Supposed format: `"Thu • 8:00pm"`.
 * Other possible format examples: `"TBA"`, `"Wed-Fri"`
 * @returns Parsed date detail.
 */
function parseDateDetail(detail) {
    const parsedDetail = {
        dayLabel: null,
        time: null,
        hours: NaN,
        minutes: NaN,
    };

    if (detail) {
        const fragments = detail.split(' ');
        if (fragments) {
            const time = parseTime(fragments);
            const [hours, minutes, dayLabel] = [parseHours(time), parseMinutes(time), parseDayLabel(fragments)];

            const props = [dayLabel, time, hours, minutes];
            [parsedDetail.dayLabel, parsedDetail.time, parsedDetail.hours, parsedDetail.minutes] = props;
        }
    }

    return parsedDetail;
}

/**
 *
 * @param {Array<string>} fragments Date detail fragments. Supposed format: `["Thu", "•", "8:00pm"]`.
 * Other possible format examples: `["TBA"]`, `["Wed-Fri"]`
 * @returns {String} Parsed day label or `null` if not provided.
 */
function parseDayLabel(fragments) {
    return fragments.length >= 3 ? fragments[0] : null;
}

/**
 *
 * @param {Array<string>} fragments Date detail fragments. Supposed format: `["Thu", "•", "8:00pm"]`.
 * Other possible format examples: `["TBA"]`, `["Wed-Fri"]`
 * @returns {String} Parsed time.
 */
function parseTime(fragments) {
    let time = null;

    if (fragments.length >= 3) {
        [time] = [fragments[2]];
    } else if (fragments.length > 0) {
        [time] = [fragments[0]];
    }

    return time;
}

/**
 *
 * @param {String} time Time in `"1:00pm"` format or `null` if not defined.
 * @returns {Number} Parsed hours number or `NaN`.
 */
function parseHours(time) {
    let hours = NaN;

    if (time) {
        const hoursNumber = parseInt(time, 10);
        hours = time.includes('am') ? hoursNumber : hoursNumber + 12;
    }

    return hours;
}

/**
 *
 * @param {String} time Time in `"8:00pm"` format or `null` if not defined.
 * @returns {Number} Parsed minutes number or `NaN`.
 */
function parseMinutes(time) {
    return time ? parseInt(time.split(':')[1], 10) : NaN;
}

/**
 *
 * @param {Array} dateOrderedParams Contains year, monthIndex, day, hours and minutes in this order.
 * @returns {Date}
 */
function parseFullDate(dateOrderedParams) {
    const dateFilteredParams = dateOrderedParams.map((param) => (Number.isNaN(param) ? null : param));

    return new Date(...dateFilteredParams);
}
