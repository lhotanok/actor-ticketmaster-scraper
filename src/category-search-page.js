import Apify from 'apify';

const { utils: { log } } = Apify;

export async function handleCategorySearchPage(context, categories) {
    const { $, request: { url } } = context;
    const urlParts = url.split('/');
    const category = urlParts[urlParts.length - 1];

    const title = await getPageTitle(context);

    const genresFilterSelector = '[data-tid=filtersPanel] [data-tid=genresFilter]';
    const optionsSelector = '[role=listbox]>[role=option]';

    const selector = `${genresFilterSelector} ${optionsSelector}`;

    categories[category] = {
        title,
        url,
        genres: {},
    };

    // skips first element which is 'All Genres' element
    $(selector).not(':first-child').each((_index, el) => {
        const genreId = $(el).attr('value');
        const genreName = $(el).text();

        categories[category].genres[genreId] = { genreName };
    });

    log.info(`Scraped subcategories of ${category} category.`);
}

async function getPageTitle({ $ }) {
    const parentElementSelector = '[data-tid=seoCategoryHeaderTag1]';

    return $(parentElementSelector).children().first().text();
}
