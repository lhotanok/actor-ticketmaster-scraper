// eslint-disable-next-line no-unused-vars
const { Page } = require('puppeteer');

/**
 *
 * @param {Page} page
 * @param {String} selector
 * @returns {Promise<String>}
 */
exports.getElementInnerText = async (page, selector) => {
    return page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element ? element.innerText.trim() : null;
    }, selector);
};

/**
 *
 * @param {Page} page
 * @param {String} selector
 * @returns {Promise<String[]>}
 */
exports.getElementsInnerTexts = async (page, selector) => {
    return page.evaluate((sel) => [...document.querySelectorAll(sel)]
        .map((element) => element.innerText.trim()), selector);
};
