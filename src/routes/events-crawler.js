import { Actor } from 'apify';
import { createCheerioRouter, log } from 'crawlee';
import { buildFetchRequest } from '../request-builder.js';

export const eventsRouter = createCheerioRouter();

eventsRouter.addDefaultHandler(async (context) => {
    const state = await context.crawler.useState();

    const {
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
    } = state;

    await handleEventsSearchPage(context, {
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
});

async function handleEventsSearchPage(context, {
    maxItems,
    sortBy,
    countryCode, geoHash, distance,
    thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
}) {
    const { request, json } = context;
    const { url, userData } = request;
    const { scrapedItems, classifications } = userData;

    log.info(`Scraping url:
    ${request.url}`);

    const { data: { products } } = json;

    if (!products) {
        return;
    }

    const { page, items } = products;

    log.info(`Found ${items.length} events`, { page: page.number });

    const events = getEventsFromResponse(items);

    // handle maxItems restriction if set
    if (maxItems) {
        const remainingItemsCount = maxItems - scrapedItems;
        if (remainingItemsCount < events.length) {
            events.splice(remainingItemsCount);
        }
    }

    await Actor.pushData(events);

    const totalScrapedItems = scrapedItems + events.length;
    log.info(`
    Total results: ${page.totalElements}
    Total pages: ${page.totalPages}
    Current page: ${userData.page + 1}`, { url });
    log.info(`Total scraped events count: ${totalScrapedItems}`);

    // there are more events to scrape
    if (page.totalPages > userData.page + 1 && (!maxItems || totalScrapedItems < maxItems)) {
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

        log.info(`Enqueuing next search request for page: ${userData.page + 1}`);
        await requestQueue.addRequest(nextRequest);
    }
}

function getEventsFromResponse(items) {
    if (!items) {
        return [];
    }

    const events = items.map((item) => {
        const { jsonLd } = item;

        // classification info
        const { id, name, url, genreName, segmentName } = item;
        const { description, image } = jsonLd;

        // date
        const { datesFormatted: { dateTitle, dateSubTitle }, dates: { localDate, dateTBA, timeTBA } } = item;

        // location
        const { location, offers, performer } = jsonLd;
        const { address: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry } } = location;

        // priceRanges
        const priceRanges = (item.priceRanges || []).map((range) => {
            // eslint-disable-next-line dot-notation
            delete range['__typename'];
            return range;
        });

        const placeUrl = location.sameAs;
        const offerUrl = offers.url;
        const { availabilityStarts, priceCurrency, price } = offers;
        const offer = {
            offerUrl,
            availabilityStarts,
            price: price ? parseFloat(price.replace(/,/g, '')) : null,
            priceCurrency: priceCurrency || null,
        };

        const performers = extractPerformers(performer);

        const event = {
            ...{ id, url, name, description, image, segmentName, genreName },
            ...{ dateTitle, dateSubTitle, localDate, dateTBA, timeTBA },
            ...{ streetAddress, addressLocality, addressRegion, postalCode, addressCountry, placeUrl },
            offer,
            priceRanges,
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
