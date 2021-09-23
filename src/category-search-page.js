import Apify from 'apify';

const { utils: { log } } = Apify;

export async function handleCategorySearchPage(context) {
    const { $, request: { url } } = context;
    const urlParts = url.split('/');
    const category = urlParts[urlParts.length - 1];

    const categoryTitle = await getPageTitle(context);

    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

    const genres = {};
    $(selector).not(':first-child').each((_index, el) => {
        const genreId = $(el).attr('value');
        const genreName = $(el).text();

        genres[genreId] = {
            genreName,
            category,
            categoryTitle,
            categoryUrl: url,
        };
    });

    log.info(`Scraped genres for ${categoryTitle} category:
    ${JSON.stringify(genres, null, 2)}`);

    return genres;
}

async function getPageTitle({ $ }) {
    const parentElementSelector = '[data-tid=seoCategoryHeaderTag1]';

    return $(parentElementSelector).children().first().text();
}
