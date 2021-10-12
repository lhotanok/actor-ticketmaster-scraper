/* eslint-disable import/extensions */
import Apify, { pushData } from 'apify';

import { buildFetchRequest } from './request-builder.js';

const { utils: { log } } = Apify;

export async function handleEventsSearchPage(context, {
    maxItems,
    sortBy,
    countryCode, geoHash, distance,
    thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
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
    log.info(`Total results: ${page.totalElements}`);
    log.info(`Total pages: ${page.totalPages}`);
    log.info(`Current page: ${userData.page}`);
    log.info(`Scraped events count: ${totalScrapedItems}`);

    // there are more events to scrape
    if (page.totalPages > userData.page + 1 && totalScrapedItems < maxItems) {
        const { crawler: { requestQueue } } = context;
        const nextRequest = buildFetchRequest({
            sortBy,
            countryCode,
            geoHash,
            distance,
            thisWeekendDate,
            dateFrom,
            dateTo,
            includeTBA,
            includeTBD,
        }, classifications, userData.page + 1, totalScrapedItems);

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
        const { location, offers, performer } = jsonLd;
        const { address: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry } } = location;

        const placeUrl = location.sameAs;
        const offerUrl = offers.url;
        const { availabilityStarts, priceCurrency, price } = offers;
        const offer = { offerUrl, availabilityStarts, price, priceCurrency };

        const performers = extractPerformers(performer);

        const event = {
            ...{ id, url, name, description, segmentName, genreName },
            ...{ dateTitle, dateSubTitle, localDate, dateTBA, timeTBA },
            ...{ streetAddress, addressLocality, addressRegion, postalCode, addressCountry, placeUrl },
            offer,
            performers,
        };

        return event;
    });

    return events;
}

function extractPerformers(performer) {
    const performers = performer.map((perf) => {
        const { name } = perf;
        const url = perf.sameAs;
        return { name, url };
    });

    return performers;
}
