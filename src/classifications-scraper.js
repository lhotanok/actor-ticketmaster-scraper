import Apify from 'apify';

const { utils: { log } } = Apify;

export function getClassificationsToScrape(input, classifications) {
    const classificationIds = [];

    // Maps category names on property names representing 'all subcategories' options
    const categoriesAllEventsMap = {
        concerts: 'concertsAll',
        sports: 'sportsAll',
        family: 'familyAll',
        'arts-theater': 'arts-theaterAll',
    };

    Object.keys(categoriesAllEventsMap).forEach((key) => {
        // Check if key category should be scraped
        if (scrapeCategory(input, key)) {
            log.info(`Category ${key} will be scraped.`);

            const genreIds = Object.keys(classifications[key].genres);

            log.info(`Genre Ids for ${key} category: ${JSON.stringify(genreIds, null, 2)}`);

            if (input[categoriesAllEventsMap[key]]) {
                // All genres set, include them all in classificationIds
                log.info(`All subcategories of ${key} will be scraped.`);
                classificationIds.push(...genreIds);
            } else {
                // Specific genres set, for each genre, check if this key in properties is set to 'true'
                // and if so, include it in classificationIds
                const inputClassifications = getClassificationsFromInput(input, genreIds);
                log.info(`Subcategories of ${key} will be scraped:
                ${JSON.stringify(inputClassifications, null, 2)}`);

                classificationIds.push(...inputClassifications);
            }
        }
    });

    const uniqueClassificationIds = [...new Set(classificationIds)];
    log.info(`Unique classification IDs to scrape: ${uniqueClassificationIds}`);

    return uniqueClassificationIds;
}

function scrapeCategory(input, category) {
    return input[category];
}

function getClassificationsFromInput(input, categoryGenreIds) {
    const classificationIds = [];

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
