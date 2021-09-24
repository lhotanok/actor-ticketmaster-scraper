import { URL, URLSearchParams } from 'url';

export function buildFetchRequest(input, classifications, page = 0, scrapedItems = 0) {
    const url = new URL(`https://www.ticketmaster.com/api/next/graphql?`);

    const variables = buildRequestVariables(input, classifications, page);

    const extensions = {
        persistedQuery: {
            version: 1,
            sha256Hash: '5664b981ff921ec078e3df377fd4623faaa6cd0aa2178e8bdfcba9b41303848b',
        },
    };

    const queryParams = {
        operationName: 'CategorySearch',
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions),
    };

    url.search = new URLSearchParams(queryParams);

    const request = {
        url: url.toString(),
        userData: { page, classifications, scrapedItems },
    };

    return request;
}

function buildRequestVariables(input, classifications, page) {
    const { sortBy, countryCode, geoHash, distance, allDates, thisWeekendDate, dateRange } = input;

    const { sort, asc } = getSortOptions(sortBy);
    const sortOrder = asc ? 'asc' : 'desc';

    const variables = {
        type: 'event',
        locale: 'en-us',
        localeStr: 'en-us',
        page,
        size: 300,
        sort: `${sort},${sortOrder}`,
        classificationId: classifications,
        lineupImages: true,
        withSeoEvents: true,
        geoHash,
        countryCode,
        radius: distance,
        unit: 'miles',
        includeTBA: 'yes',
        includeTBD: 'yes',
    };

    return variables;
}

function getSortOptions(sortBy) {
    const sortOptions = { sort: 'date', asc: true }; // sort by date by default

    if (sortBy === 'date' || sortBy === 'relevance') {
        sortOptions.sort = sortBy;
    } else if (sortBy) {
        const lowerCaseSort = sortBy.toLowerCase();

        if (lowerCaseSort.includes('asc')) {
            sortOptions.sort = lowerCaseSort.replace('asc', '');
        } else if (lowerCaseSort.includes('desc')) {
            sortOptions.sort = lowerCaseSort.replace('desc', '');
            sortOptions.asc = false;
        }
    }

    return sortOptions;
}
