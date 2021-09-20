# Ticketmaster scraper

Scrapes event information from [Ticketmaster](Ticketmaster.com) international website. Filters events according to the given genres, dates, location or search keywords.

Ticketmaster's user interface provides 1-genre-only search so one of the actor's goals should be faster event data extraction when the user is interested in multiple genres.

Also, Ticketmaster's UI doesn't allow to specify event's country. It makes a great job at filtering events according to the exact geolocation which is recognized automatically using a web browser. However, let's say the event search is performed from the location near country borders. In this case, events from the neighbor countries can get preferred over the home events by the search filter as they're close according to their geo location. There is no option for excluding events from other countries. 

## Data attributes

- The individual attributes can be excluded from the output dataset if desired.

### Event

- name : `string`
- id : `string`
- category: `string`
- genre : `string`
- URL : `string`
- list of images URLs : `array<string>`
- date : `object`
  - local : `string`
  - standardized date object : `string`
- place : `object`
  - street address : `string`
  - city name: `string`
  - postal code: `string`
  - country : `string`
- price offer : `object`
  - price: `number`
  - currency : `string`
  - url: `string`
- performer: `object`
  - name: `string`
  - url: `string`

## Crawling details

- Request to 1 page covers approximately 10 events. The number of pages to scrape can be adjusted through input value for better request count control.
- Residential proxies are needed for successful scraping rate without request blocking.

## Scraping process

### Category search

Category names corresponding to Ticketmaster's API are specified. Scraping is only performed for those chosen categories. Valid categories are: 

- **Concerts**
- **Sports**
- **Arts & Theater**
- **Family**

Category names should be provided as an enumeration of valid values so that they could be easily ticked for scraping. If no category is given, all categories are crawled by default as no filter was set.

For each category, the desired genres can be set as well. These might also be provided as a fixed set of valid values mapped on Ticketmaster's genre categories.

### Keyword search

Besides the category-based search, keywords can be provided as well to identify events to scrape. These two features can not be combined which is given by the Ticketmaster's webpage structure.

### Place specification

A desired event location can be set using the following settings (they can be combined):

- **[Country codes](https://www.iso.org/obp/ui/#search)** - to select events that take place only in the specific countries. Compatible country codes are standardized Alpha-2 codes.
- **List of the exact geographical locations** in one of the following formats:
  - Longitude + latitude
  - Geohash

If the geographical location is specified, a distance radius can be set as well.

### Date specification

Event date range can be specified following the Ticketmaster's options. These are:

- **This Weekend**
- **Date range** from-to

### Result dataset

Output dataset can be adjusted by excluding some of the fields. Brief datasets including e. g. only event's name, date, place and URL might be suitable for simple overview and quick orientation in the available events. To get more detailed info, an actor can be run again with more dataset fields ticked.

### Website UI inspection

To get on a web page with event details using category-based search and Ticketmaster's UI, we need to navigate to the category page (e. g. [concerts category](https://www.ticketmaster.com/discover/concerts)). Once we're there, we choose the desired genre under the dropdown element labeled 'Select Your Genre'. This step can be skipped if no genre filter is required. We can specify date range and distance from the exact geographical location on the same page. Our geohash is calculated automatically from the browser and it is stored in browser cookies.

We can retrieve quite a lot of information from the category page. Event name, place and date can be extracted directly from its HTML.

For details about current ticket offers the button 'See Tickets' needs to be clicked.



