import Apify from 'apify';

const { utils: { log } } = Apify;

export function getClassificationsToScrape(input, classifications) {
    const classificationIds = [];

    const categories = ['concerts', 'sports', 'arts-theater', 'family'];

    categories.forEach((category) => {
        // Check if key category should be scraped
        if (scrapeCategory(input, category)) {
            log.info(`Category ${category} will be scraped.`);

            const { genres } = classifications[category];

            // for each genre, check if it is set in properties to 'true'
            // and if so, include it in classificationIds
            const inputClassificationIds = getClassificationIdsFromInput(input, genres);
            if (inputClassificationIds.length === 0) {
                // no specific classification set, scrape all classifications of this category
                const allGenreIds = Object.keys(genres).map((genreName) => genres[genreName].genreId);
                inputClassificationIds.push(...allGenreIds);
            }

            classificationIds.push(...inputClassificationIds);
        }
    });

    const uniqueClassificationIds = [...new Set(classificationIds)];
    log.info(`Classification IDs will be scraped: ${uniqueClassificationIds}`);

    return uniqueClassificationIds;
}

function scrapeCategory(input, category) {
    return input[category];
}

function getClassificationIdsFromInput(input, genres) {
    // input with duplicate properties removed
    const normalizedInput = {};

    Object.keys(input).forEach((property) => {
        const normalizedProperty = property.split('_')[0]; // handles classification IDs duplicates that include '_'
        normalizedInput[normalizedProperty] = input[property];
    });

    const classificationIds = [];

    Object.keys(genres).map((genreName) => {
        if (normalizedInput[genreName]) {
            classificationIds.push(genres[genreName].genreId);
        }
    });

    return classificationIds;
}
