/* eslint-disable import/extensions */
import Apify, { pushData } from 'apify';

import { buildFetchRequest } from './request-builder.js';

const { utils: { log } } = Apify;

export async function handleEventsSearchPage(context, {
    maxItems,
    sortBy,
    countryCode, geoHash, distance,
    allDates, thisWeekendDate, dateFrom, dateTo,
}) {
    const { request, json } = context;
    const { userData } = request;
    const { scrapedItems, classifications } = userData;

    log.info(`Scraping url:
    ${request.url}`);

    const { data: { products: { page, items } } } = json;

    const events = getEventsFromResponse(items);

    const remainingItemsCount = maxItems - scrapedItems;
    if (remainingItemsCount < events.length) {
        events.splice(remainingItemsCount);
    }

    await pushData(events);

    const totalScrapedItems = scrapedItems + events.length;
    if (page.totalPages > userData.page && totalScrapedItems < maxItems) {
        const { crawler: { requestQueue } } = context;
        const nextRequest = buildFetchRequest({ sortBy, countryCode, geoHash, distance, allDates, thisWeekendDate, dateFrom, dateTo },
            classifications, userData.page + 1, totalScrapedItems);

        await requestQueue.addRequest(nextRequest);
    }
}

function getEventsFromResponse(items) {
    const events = items.map((item) => {
        const { jsonLd } = item;

        // classification info
        const { id, name, url, genreName, segmentName } = item;
        const { description } = jsonLd;

        // date
        const { datesFormatted: { dateTitle, dateSubTitle }, dates: { localDate, dateTBA, timeTBA } } = item;

        // location
        const { location } = jsonLd;
        const { address: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry } } = location;
        const placeUrl = location.sameAs;

        const event = {
            ...{ id, url, name, description, segmentName, genreName },
            ...{ dateTitle, dateSubTitle, localDate, dateTBA, timeTBA },
            ...{ streetAddress, addressLocality, addressRegion, postalCode, addressCountry, placeUrl },
        };

        return event;
    });

    return events;
}
