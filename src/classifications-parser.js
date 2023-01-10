import { log } from 'apify';

export function parseClassificationsToScrape(input, classifications) {
    const classificationIds = [];

    const categories = ['concerts', 'sports', 'arts-theater', 'family'];

    categories.forEach((category) => {
        // Check if key category should be scraped
        if (input[category]) {
            const { genres } = classifications[category];

            // for each genre, check if it is set in properties to 'true'
            // and if so, include it in classificationIds
            const inputClassificationIds = getClassificationIdsFromInput(input, genres, category);
            if (inputClassificationIds.length === 0) {
                // category explicitly checked for scraping, no specific classification set, scrape all classifications of this category
                const allGenreIds = Object.keys(genres).map((genreName) => genres[genreName].genreId);
                log.info(`All subcategories of ${category} category will be scraped.`);
                inputClassificationIds.push(...allGenreIds);
            }

            log.info(`${inputClassificationIds.length} classifications of ${category} category will be scraped.
            Classification IDs: ${inputClassificationIds}`);
            classificationIds.push(...inputClassificationIds);
        }
    });

    const uniqueClassificationIds = [...new Set(classificationIds)];

    if (uniqueClassificationIds.length > 0) {
        log.info(`Classification IDs will be scraped: ${uniqueClassificationIds}`);
    } else {
        log.warning(`No category specified, all events will be scraped.
        If you checked any specific subcategories, they will be ignored and all subcategories will be scraped instead.`);
    }

    return uniqueClassificationIds;
}

function getClassificationIdsFromInput(input, genres, category) {
    // input with duplicate properties removed
    const normalizedInput = {};

    Object.keys(input).forEach((property) => {
        // handles classification IDs duplicates that include '_'
        const propertyNameParts = property.split('_');
        const normalizedProperty = propertyNameParts[0];

        const categoryPostfix = propertyNameParts.length > 1 ? propertyNameParts[1] : null;

        if (!categoryPostfix || (categoryPostfix === category && property.includes(categoryPostfix))) {
            // log.info(`category postfix: ${categoryPostfix}, category: ${category}, property: ${property}`);
            // we need to store value of property that belongs to the current category (e.g. we are checking concerts category, genre classical,
            // classical is set to false but classical_arts-theater is set to true, it would get stored as normalizedInput.classical = true
            // so we would later assume we should scrape classical music when we only want classical theatre)
            normalizedInput[normalizedProperty] = input[property];
        }
    });

    const classificationIds = [];

    Object.keys(genres).map((genreName) => {
        if (normalizedInput[genreName]) {
            classificationIds.push(genres[genreName].genreId);
        }
    });

    return classificationIds;
}
