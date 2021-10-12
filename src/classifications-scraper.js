import Apify from 'apify';

const { utils: { log } } = Apify;

export function getClassificationsToScrape(input, classifications) {
    const classificationIds = [];

    const categories = ['concerts', 'sports', 'arts-theater', 'family'];

    categories.forEach((category) => {
        // Check if key category should be scraped
        if (scrapeCategory(input, category)) {
            log.info(`Category ${category} will be scraped.`);

            const genreIds = Object.keys(classifications[category].genres);

            // for each genre, check if it is set in properties to 'true'
            // and if so, include it in classificationIds
            const inputClassifications = getClassificationsFromInput(input, genreIds);
            if (inputClassifications.length === 0) {
                // no specific classification set, scrape all classifications of this category
                inputClassifications.push(...genreIds);
            }

            classificationIds.push(...inputClassifications);
        }
    });

    const uniqueClassificationIds = [...new Set(classificationIds)];
    log.info(`Classification IDs will be scraped: ${uniqueClassificationIds}`);

    return uniqueClassificationIds;
}

function scrapeCategory(input, category) {
    return input[category];
}

function getClassificationsFromInput(input, categoryGenreIds) {
    const classificationIds = [];

    // input with duplicate properties removed
    const normalizedInput = {};

    Object.keys(input).forEach((property) => {
        const normalizedProperty = property.split('-')[0]; // handles classification IDs duplicates that include '-'
        normalizedInput[normalizedProperty] = input[property];
    });

    categoryGenreIds.forEach((genreId) => {
        if (normalizedInput[genreId]) {
            classificationIds.push(genreId);
        }
    });

    return classificationIds;
}
