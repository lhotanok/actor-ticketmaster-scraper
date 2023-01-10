import { createCheerioRouter } from 'crawlee';

export const categoriesRouter = createCheerioRouter();

categoriesRouter.addDefaultHandler(async (context) => {
    const scrapedCategories = await scrapeCategories(context);

    const categoryState = await context.crawler.useState();

    Object.entries(scrapedCategories).forEach(([key, value]) => {
        categoryState[key] = value;
    });
});

async function scrapeCategories(context) {
    const categories = {};

    const { $, request: { url } } = context;
    const urlParts = url.split('/');
    const category = urlParts[urlParts.length - 1];

    const title = getPageTitle(context);

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
        const encodedGenreName = encodeGenreName(genreName);

        categories[category].genres[encodedGenreName] = { genreId, genreName };
    });

    return categories;
}

function getPageTitle({ $ }) {
    const parentElementSelector = '[data-tid=seoCategoryHeaderTag1]';

    return $(parentElementSelector).children().first().text();
}

function encodeGenreName(name) {
    const lowercase = name.toLowerCase();
    return lowercase.replaceAll('&', 'and').replaceAll('/', ' and ').replaceAll('\'', '').replaceAll(' ', '-');
}
