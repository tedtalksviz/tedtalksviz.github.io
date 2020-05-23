from bs4 import BeautifulSoup, Comment
import json
import requests
import re
import pandas as pd
from time import sleep
from random import randint


def request_webpage(url):
    limit = 5
    i = 0
    while i < limit:
        sleep(randint(10, 25))
        try:
            page = requests.get(url, timeout=60)
            status = str(page.status_code)
            if status[:1] != '2':
                page = ''
            break
        except:
            i += 1
    return page


def get_location(soup, event_name):
    ans_city = ''
    ans_country = ''
    rows = soup.findAll('table')[0].find('tbody').findAll('tr')
    for row in rows[:5]:
        tds = row.findAll('td')
        if len(tds) == 5:
            name = tds[1].find('strong').find('a').string.replace(
                '&shy', '').replace(';\xad', '').replace('\xad', '')
            location = tds[2].findAll(text=True, recursive=False)
            city = location[1].replace('\n', '')
            country = location[2]
            if name == event_name:
                ans_city = city
                ans_country = country
                break
    return ans_city, ans_country


def scrape(event_name, year):
    city = ''
    country = ''
    url = 'https://www.ted.com/tedx/events?when=past&autocomplete_filter={0}&year={1}'.format(
        event_name, year)
    page = request_webpage(url)
    if page != '':
        page_soup = BeautifulSoup(page.text, 'html.parser')
        city, country = get_location(page_soup, event_name)
    return city, country


events = pd.read_csv('../resources/events.csv')
events['city'] = ''
events['country'] = ''
for i, row in events.iterrows():
    event_name = row['event'].replace(' ', '')
    year = row['film_date'][0:4]
    print('Processing', i)
    city, country = scrape(event_name, year)
    if city != '':
        events.loc[i, 'city'] = city
        events.loc[i, 'country'] = country
    else:
        regex = re.compile('[^a-zA-Z]')
        event_name = regex.sub('', event_name)
        city, country = scrape(event_name, year)
        if city != '':
            events.loc[i, 'city'] = city
            events.loc[i, 'country'] = country

events.to_csv('../data/locations_scraped.csv', index=False, header=True)
