import Apify from 'apify';

const { utils: { log } } = Apify;

export async function getClassificationsToScrape(input, classifications) {
    const classificationIds = [];

    // Maps category names on property names representing 'all subcategories' options
    const categoriesAllEventsMap = {
        concerts: 'concertsAll',
        sports: 'sportsAll',
        theater: 'arts-theaterAll',
        family: 'familyAll',
    };

    Object.keys(categoriesAllEventsMap).forEach((key) => {
        // Check if key category should be scraped
        if (scrapeCategory(input, key)) {
            log.info(`Category ${key} will be scraped.`);

            const genreIds = classifications.filter((cls) => cls.category === key).map((categoryCls) => categoryCls.id.split('-')[0]);
            const uniqueGenreIds = [...new Set(genreIds)];

            if (input[categoriesAllEventsMap[key]]) {
                // All genres set, include them all in classificationIds
                log.info(`All subcategories of ${key} will be scraped.`);
                classificationIds.push(...uniqueGenreIds);
            } else {
                // Specific genres set, for each genre, check if this key in properties is set to 'true'
                // and if so, include it in classificationIds
                uniqueGenreIds.forEach((genreId) => {
                    if (input[genreId]) {
                        classificationIds.push(genreId);
                    }
                });
            }
        }
    });

    return classificationIds;
}

async function getClassificationsByCallingGenreActor() {
    const apifyClient = Apify.newClient({ token: process.env.APIFY_TOKEN });
    const actorClient = apifyClient.actor('lhotanok~ticketmaster-genre-scraper');

    log.info(`Calling lhotanok~ticketmaster-genre-scraper actor.`);
    const run = await actorClient.call();
    const runClient = apifyClient.run(run.id);

    const { items } = await runClient.dataset().listItems();
    return items;
}

function scrapeCategory(input, category) {
    return input[category];
}
