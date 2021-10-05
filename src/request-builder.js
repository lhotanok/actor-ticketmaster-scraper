import { URL, URLSearchParams } from 'url';

export function buildFetchRequest({
    sortBy,
    countryCode, geoHash, distance,
    allDates, thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
},
classifications, page = 0, scrapedItems = 0) {
    const url = new URL(`https://www.ticketmaster.com/api/next/graphql?`);

    const variables = buildRequestVariables({
        sortBy,
        countryCode,
        geoHash,
        distance,
        allDates,
        thisWeekendDate,
        dateFrom,
        dateTo,
        includeTBA,
        includeTBD,
    }, classifications, page);

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

function buildRequestVariables({
    sortBy,
    countryCode, geoHash, distance,
    allDates, thisWeekendDate, dateFrom, dateTo, includeTBA, includeTBD,
}, classifications, page) {
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
        includeTBA,
        includeTBD,
    };

    addDateVariable(variables, { allDates, thisWeekendDate, dateFrom, dateTo });

    return variables;
}

function getSortOptions(sortBy) {
    const sortOptions = { sort: 'date', asc: true }; // sort by date in asc order by default

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

function addDateVariable(variables, { allDates, thisWeekendDate, dateFrom, dateTo }) {
    // if all dates are set, no filter needs to be specified
    if (!allDates) {
        if (thisWeekendDate) {
            variables.localStartEndDateTime = getWeekendDatesString();
        } else if (dateFrom && dateTo) {
            variables.localStartEndDateTime = getDateRangeString(dateFrom, dateTo);
        } else if (dateFrom) {
            validateDateFormat(dateFrom);
            variables.localStartDateTime = new Date(dateFrom);
        } else if (dateTo) {
            validateDateFormat(dateTo);
            variables.localEndDateTime = new Date(dateTo);
        }
    }
}

function getWeekendDatesString() {
    const date = new Date();

    const saturday = date.getDate() - (date.getDay() - 1) + 5;
    const sunday = date.getDate() - (date.getDay() - 1) + 6;

    const saturdayDate = new Date(date.setDate(saturday));
    const sundayDate = new Date(date.setDate(sunday));

    setDateFromHours(saturdayDate);
    setDateToHours(sundayDate);

    return `${convertDateToISOFormat(saturdayDate)},${convertDateToISOFormat(sundayDate)}`;
}

function getDateRangeString(dateFrom, dateTo) {
    validateDateFormat(dateFrom);
    validateDateFormat(dateTo);

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    setDateFromHours(from);
    setDateToHours(to);

    return `${convertDateToISOFormat(from)},${convertDateToISOFormat(to)}`;
}

function validateDateFormat(dateFormat) {
    if (!Date.parse(dateFormat)) {
        throw new Error(`Invalid date format provided. Valid format is: YYYY-MM-DD. Format from input: ${dateFormat}.`);
    }
}

function setDateFromHours(date) {
    date.setUTCHours(0, 0, 0);
}

function setDateToHours(date) {
    date.setUTCHours(23, 59, 59);
}

function convertDateToISOFormat(date) {
    return date.toISOString().split('.')[0];
}
