# Ticketmaster Scraper

## Table of contents

<!-- toc start -->

- [Introduction](#introduction)
- [Cost of usage](#costOfUsage)
- [Number of results](#numberOfResults)
- [Use Cases](#useCases)
- [Input](#input)
- [Output](#output)

<!-- toc end -->

<div id='introduction'/>

## Introduction

Want to know about all relevant events [Ticketmaster.com](https://www.ticketmaster.com/) promotes but don't have enough time to inspect the whole website? Going through all categories and genres one by one can get really time consuming when you're interested in many categories but still want to exclude some of them for which you need to use a filter. Ticketmaster.com user interface only provides filtering of 1 category and 1 genre (e. g. you can search category Concerts and filter rock genre only). But what if you're also fan of metal, pop or even classical music? Ticketmaster Scraper searches all of these events at once and stores them in one dataset. You can merge different categories with their corresponding subcategories or generate the individual datasets for each category or genre, it's only up to you.

Another useful feature that is missing on [Ticketmaster.com](https://www.ticketmaster.com/) website is filtering events based on their location. Ticketmaster uses location from your web browser and searches events close to your area. That's definitely handy but what if you want to change the settings and give another location? Or you're currently near country borders which results in searching of events that take place in a different country. This happens quite often as only the exact geographical location is considered. With this actor, you can easily specify country or the exact location through [geohash](https://www.movable-type.co.uk/scripts/geohash.html) value. It's enough to set only one of these values but you can also combine them to get events from a specific country near the city represented by a certain geohash.

To provide compatibility with Ticketmaster's built-in search engine, Ticketmaster Scraper comes with sort options and date filter as well. You can sort the events by:

- Date
- Most Popular
- Distance
- Names A-Z
- Names Z-A

And finally filter events in a specific date range. However, Ticketmaster offers many events with no date announced or defined yet. In such case, the shortcuts TBA or TBD are used respectively. TBA and TBD events are included in the dataset by default. You can exclude them by setting TBA Events and TBD Events to `No`. Or you can even create a dataset of TBA and TBD events only.

<div id='costOfUsage'/>

## Cost of usage

Ticketmaster Scraper is a free of charge actor but it requires [Apify Proxy](https://apify.com/proxy) to work properly. More specifically, it needs the [residential proxy](https://apify.com/pricing/proxy) as Ticketmaster's blocking policy is strict and it blocks datacenter proxies by default. Apart from the residential IPs cost, [compute units](https://apify.com/pricing/actors) are charged for running the actor at the Apify platform.

Ticketmaster Scraper is able to scrape 300 events per 1 request which keeps both compute units and residential proxy expenses very low.

### Residential proxies

You can use residential proxies if you subscribe to a paid [plan at the Apify platform](https://apify.com/pricing). Residential IPs are charged based on the transferred data so try to optimize the maximum number of events scraped with respect to [residential proxy pricing](https://apify.com/proxy?pricing=residential-ip#pricing). These proxies are only available to be run within actors on the Apify platform, not externally. If you're interested in using residential proxies for this scraper, contact `support@apify.com` via email or in-app chat to get the proxies enabled.

### Consumption units

The actor is able to scrape approximately **15,000 events for 1 CU**. However, you'll never consume the whole CU during 1 run due to Ticketmaster's max items limitation. When you scrape the maximum number of events per 1 run which is about 5000 items, it should cost about 1/3 CU.

<div id='numberOfResults'/>

## Number of results

Set the maximum number of scraped events using the `maxItems` input field. 

**_NOTE:_**  Ticketmaster limits searched results to 5100 with 300 items per 1 page (17 pages). If you need to scrape more events, you'll have to create multiple more specific input configurations that give you fewer search results and then combine the results together.

<div id='useCases'/>

## Use Cases

Ticketmaster is one of the leading companies in the field of event tickets purchasing. It comes with the nice search engine which helps you find the relevant events but it's missing a few features that can simplify the search process. Mainly the filtering of multiple categories and subcategories at once and also proper location specification. The events scraper can be useful e. g. in the following situations:

- **Personal monitoring of relevant events** - handy search filters, no need to browse the [Ticketmaster.com](https://www.ticketmaster.com/) website
- **Price analysis** - compare Ticketmaster's price offers to other ticket providers
- **Ticket availability monitoring** - set notifications to remind you the time when the relevant tickets are put up for sale
- **Events analysis by different criteria** (location, date range) - monitor which countries are missing the events of a specific category and fill this spot

<div id='input'/>

## Input

Ticketmaster Scraper offers various settings for customized event searching. Some of them follow the standard [Ticketmaster.com](https://www.ticketmaster.com/) API, others are designed to extend the existing API by new features.

### Categories

First, check all event categories you want to scrape. Input categories are mapped on the categories at [Ticketmaster.com](https://www.ticketmaster.com/). You can choose from:

- **Concert** Events
- **Sport** Events
- **Arts & Theater** Events
- **Family** Events

**_NOTE:_**  Feel free to check multiple categories at once but keep in mind that Ticketmaster limits the maximum [number of results](#numberOfResults) it returns. So it might be a good idea to create a separate dataset for each category and only specify more subcategories. Or you could add more restrictive filter such as the exact location or date range.

### Subcategories

The actor provides list of subcategories for each of the main categories. They represent different **disciplines** of Sport events and various **genres** of Concerts, Arts & Theater and Family events. `All Disciplines` or `All Genres` fields are checked by default so don't forget to uncheck them if you check the certain subcategories instead.

### Location

Specify a desired `country` in the form of [ISO Alpha-2 Country Code](https://www.iban.com/country-codes) or an exact geographical point by filling the `geohash` value. Depending on your needs, you can use both of these fields or just one of them. Last but not least, set the `distance` radius in mile units.

### Date

No date restrictions are set by default so `All Dates` field is checked. You may uncheck it and check `This Weekend` field instead or specify the date range. While setting the date range, you don't have to fill both `From` and `To` fields. If it suits you, fill one of them only. Inside the date section, `TBA` and `TBD` events filter is also handled. By choosing the appropriate value, you can exclude the events whose date is to be announced (TBA) or to be defined (TBD). Or you can go the other way round and include TBA and TBD events only. 

### Other

Apart from the previously mentioned fields, Ticketmaster Scraper also provides `Max Items` settings to limit the size of the result dataset. And to keep dataset processing simplified, it's able to sort the items by their date, relevance, distance or name.

<div id='output'/>

## Output

The actor stores all scraped events in a dataset where each event is a separate item in the dataset. You can get the following information for each event:

- **id**
- **url**
- **name**
- **description**
- **segment name** (category)
- **genre name**
- **date** (title, subtitle)
- **location** (address, postal code, place url)
- **offer** (url, start date for ticket purchase, price)
- **performers** (list of performers with their name and url)

### Example dataset event item

```json
{
  "id": "vvG1YZpdLJK6fm",
  "url": "https://www.ticketmaster.com/mickey-gilley-and-johnny-lee-thackerville-oklahoma-10-25-2020/event/0C005837E64C752E",
  "name": "Mickey Gilley and Johnny Lee",
  "description": "Mickey Gilley and Johnny Lee | Sun 10/25 @ 3:00pm | Global Event Center at WinStar World Casino and Resort, Thackerville, OK",
  "segmentName": "Music",
  "genreName": "Country",
  "dateTitle": "Oct 25",
  "dateSubTitle": "Sun 3:00pm",
  "streetAddress": "777 Casino Avenue",
  "addressLocality": "Thackerville",
  "addressRegion": "OK",
  "postalCode": "73459",
  "addressCountry": "US",
  "placeUrl": "https://www.ticketmaster.com/global-event-center-at-winstar-world-casino-and-resort-tickets-thackerville/venue/99186",
  "offer": {
    "offerUrl": "https://www.ticketmaster.com/mickey-gilley-and-johnny-lee-thackerville-oklahoma-10-25-2020/event/0C005837E64C752E",
    "availabilityStarts": "",
    "price": "35",
    "priceCurrency": "USD"
  },
  "performers": [
    {
      "name": "Mickey Gilley",
      "url": "https://www.ticketmaster.com/mickey-gilley-tickets/artist/732778"
    },
    {
      "name": "Johnny Lee",
      "url": "https://www.ticketmaster.com/johnny-lee-tickets/artist/732830"
    }
  ]
}
```

