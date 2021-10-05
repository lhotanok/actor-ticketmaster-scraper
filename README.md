# Ticketmaster Scraper

## Table of contents

<!-- toc start -->

- [Introduction](#introduction)
- [Cost of usage](#costOfUsage)
- [Number of results](#numberOfResults)
- [Use Cases](#useCases)
  - Case 1
  - Case 2
- [Input](#input)
- [Output](#output)
- [Miscellaneous](#miscellaneous)

<!-- toc end -->

## Introduction<a name="introduction"></a>

Want to know about all relevant events [Ticketmaster.com](https://www.ticketmaster.com/) promotes but don't have enough time to inspect the whole website? Going through all categories and genres one by one can get really time consuming when you're interested in many categories but still want to exclude some of them for which you need to use a filter. Ticketmaster.com user interface only provides filtering of 1 category and 1 genre (e. g. you can search category Concerts and filter rock genre only). But what if you're also fan of metal, pop or even classical music? Ticketmaster Scraper searches all of these events at once and stores them in one dataset. You can merge different categories with their corresponding subcategories or generate the individual datasets for each category or genre, it's only up to you.

Another useful feature that is missing on [Ticketmaster.com](https://www.ticketmaster.com/) website is filtering events based on their location. Ticketmaster uses location from your web browser and searches events close to your area. That's definitely handy but what if you want to change the settings and give another location? Or you're currently near country borders which results in searching of events that take place in a different country. This happens quite often as only the exact geographical location is considered. With this actor, you can easily specify country or the exact location through [geohash](https://www.movable-type.co.uk/scripts/geohash.html) value. It's enough to set only one of these values but you can also combine them to get events from a specific country near the city represented by a certain geohash.

To provide compatibility with Ticketmaster's built-in search engine, Ticketmaster Scraper comes with sort options and date filter as well. You can sort the events by:

- Date
- Most Popular
- Distance
- Names A-Z
- Names Z-A

And finally filter events in a specific date range. However, Ticketmaster offers many events with no date announced or defined yet. In such case, the shortcuts TBA or TBD are used respectively. TBA and TBD events are included in the dataset by default. You can exclude them by setting TBA Events and TBD Events to `No`. Or you can even create a dataset of TBA and TBD events only.

## Cost of usage<a name="costOfUsage"></a>

Ticketmaster Scraper is a free of charge actor but it requires [Apify Proxy](https://apify.com/proxy) to work properly. More specifically, it needs the [residential proxy](https://apify.com/pricing/proxy) as Ticketmaster's blocking policy is strict and it blocks datacenter proxies by default. Apart from the residential IPs cost, [compute units](https://apify.com/pricing/actors) are charged for running the actor at the Apify platform.

Ticketmaster Scraper is able to scrape 500 events per 1 request which keeps both compute units and residential proxy expenses very low.

### Residential proxies

You can use residential proxies if you subscribe to a paid [plan at the Apify platform](https://apify.com/pricing). Residential IPs are charged based on the transferred data so try to optimize the maximum number of events scraped with respect to [residential proxy pricing](https://apify.com/proxy?pricing=residential-ip#pricing). These proxies are only available to be run within actors on the Apify platform, not externally. If you're interested in using residential proxies for this scraper, contact `support@apify.com` via email or in-app chat to get the proxies enabled.

### Consumption units

The actor is able to scrape approximately 15,000 events for 1 CU.

## Number of results<a name="numberOfResults"></a>

Set the maximum number of scraped events using the `maxItems` input field. 

**_NOTE:_**  Ticketmaster limits searched results to 5100 (17 pages with 300 items per 1 page). If you need to scrape more events, you'll have to create multiple more specific input configurations that give you fewer search results and then combine the results together.

## Use Cases <a name="useCases"></a>



## Input <a name="input"></a>

Ticketmaster Scraper offers various settings for customized event searching. Some of them follow the standard [Ticketmaster.com](https://www.ticketmaster.com/) API, others are designed to extend the existing API by new features.

### Extra features



## Output <a name="output"></a>

