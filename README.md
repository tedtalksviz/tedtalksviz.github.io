# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Antti Hemilä|319669|
|Erik Husgafel|319670|
|Maria Pandele|313122|

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**
### Dataset
We decided to analyze dataset (https://www.kaggle.com/rounakbanik/ted-talks) of 2550 TED-talks from
the official TED.com website until September 21st, 2017. This dataset contains two files, 
* `ted_main.csv` - for each TED talk:
  * metadata about it: title, description, duration, event, languages, film and publish dates, url, number of views, tags about the subject
  * ratings given to each talk on 14 dimensions
  * information about the speaker: number of speakers, name, occupation
  * relationship between talks: a recommandation of talks to watch next
* `transcripts.csv` - transcript of the talk with audience reactions (Applause, Applause continues,
Music, Music ends, Laughter)

Data is overall clean. We found only 6 missing values for speaker's occupation which we replaced with
Unknown for now. Since they are not that many, we could manually search the speakers on websites like
Wikipedia and fill in the missing information, making sure that we use the same keywords as we have 
in other rows of the *speaker_ocupation* column.

Preprocessing steps taken so far:
1. replaced NaN with Unknown in *speaker_ocupation* column
2. expand the *ratings* column in 14 different columns
3. transfored unix timestamp for *film_date* and *publish_date* to day, month, year format

Preprocessing steps we are considering:
1. sanitize the occupations (for example, consider aggregating types of artists into just "Artist")
2. manually fill in the data for 6 speakers which have no occupation in the dataset 
3. build a network of talks using *related_talks* column to make the edges
4. compute basic data from the transcripts: number of words, speed of speech


### Problematic

Our main goal for this project is to provide the user with interactive tools for exploring the talks. 
The visualizations focus on segmenting talks to different groups and finding relationships between them. 
We hope our visualization will provide some insight on how different talk characteristics (speed, 
speaker occupation and gender, sentiment of the talk, TED-event of the talk, TEDx-boolean) correlate 
with: the way the talk is perceived (whether it is funny/inspiring/courageous, or does the talk lack 
these ratings) and  with the popularity of the talk (number of views and number of languages).

Besides exploring correlations, another main goal for visualizing the TED-talks is to look at the 
relationships between the lectures. We will find relationships between talks based on the 
*recommended_talks* and *tags* columns. Visualizing this network of relationships will also help 
find if there are some clusters in the data. For example, as TED is an acronym for "Technology, 
Entertainment, Design", it would be interesting to see if there were some clustering of talks to 
these three dimensions.

After visualizing these relationships, the user can find interesting talks that are closely related 
on some arbitrary user-defined TED-talk. 

Our target audience are new university students, as visualizations of this project together with 
TED-talks could provide them some insight on how to give popular talks (high-school curriculum has 
a lack of self-expression and presentation skills). We also hope our project would reach those yet 
unfamiliar with TED and evoke them to start exploring the vast and free world of sophisticated and 
educational specialist presentations. 


### Exploratory Data Analysis

We analyzed the data in this [notebook](/Exploratory%20data%20analysis.ipynb). The ted\_main.csv file 
contains information about 2550 ted talks. These are given by various people, the most profilic one 
having given only 9 talks: Hans Rosling - TED talks are not easy to give. Approximately 97% of the 
talks have one speaker. On average a TED talk lasts for approxiamtely 14 minutes, the shortest one
having under 3 minutes while the longest one has 1.5 hours. The talks cover more than 416 subjects,
the top 3 ones being in order technology, science and global issues. All of the talks have gathered 
aproximately 4.3 billion views.

The distribution of number of talks per event is long tailed. We found that almost half of the TED
events in this dataset have only one talk. This dataset also contains individually organized TED 
events known as TEDx and they represent 18% of our data.

In terms of dates, the older TED talk was filmed in 1972 but got published 38 years after in 2010.
The general trend however, is that talks are published in the same year as they were recorded and 
their numbers have increased exponentially since 1990.

Each talk is being rated on 14 dimesions. Keeping only the rating with the biggest score for each
talk, we find that most talks are rated as being insipiring, informative and fascinating.


### Related Work

* Data visualisation project by [Yannick Pulver](https://yannickpulver.com/ivis/) is concentrating on
presenting Ted Talks view counts as a “drop of sauce”. In his project, it is possible to filter data
based on the topics and ratings of the speeches.

* Turkan Sevgili’s analysis (https://mef-bda503.github.io/pj-sevgilit/files/TED_Talks.html) includes plotters about “Top 10 Ted Speakers” in number of speeches held by a speaker, “Top 15 Occupations of the Speakers”, number of available languages for a speech, correlation between view counts and number of available languages for a speech, and correlation between comments and view counts.

Following kernels which provide pretty thorough data analysis of the TED Talks data set: 
  * https://www.kaggle.com/lpang36/analysis-of-ted-talk-ratings 
  * https://www.kaggle.com/anandaribeiro/understanding-ted-talks-ratings - this one concentrates on 
    exploring the rating system in the data set and to find correlations between 
    ratings and other dimensions in the data set. These analysis provide a profound foundation for 
    our project and give us a good understanding of the data set that we’re working with

As shown above, there already exists analysis from the data set. However, we believe that we can 
provide even more insight about the data set and especially, present the information in more 
informative way. Most of the analysis above present the information only in two-dimensional plotter, 
but we believe that we can visualize the data in more informative way and by that help the user to 
find correlations between factors that none of the projects so far has been able to do. Therefore, 
our approach in emphasizing the visuality of the data will help the end user to find new information 
from the data set in an easy way.

Our source of inspiration gems from beautiful and informative visualizations of data and we will focus
more on network visualtization as well as multi dimensional graphs with the help of visual elements
(dimension, color, forms etc). In addition, we will use the examples of earlier years as a source 
of inspiration for our final work.

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**

The 2 pages report for the milestone 2: [Milestone2.pdf](Milestone2.pdf).
Functional prototype: [tedtalksviz.github.io](https://tedtalksviz.github.io).


## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

### Usage

Our project can be easily used with a local server. Recommended steps are:

* Clone the project
```
git clone https://github.com/com-480-data-visualization/com-480-project-robert-drop-table-students.git project
```

* Start a local server

You can easily do this with [http-server](https://www.npmjs.com/package/http-server)
```
npm install -g http-server
cd project
http-server
```

Or you can also use python3 like this:
```
cd project 
python -m http.server
```

In both cases the server will start on: http://127.0.0.1:8080.
