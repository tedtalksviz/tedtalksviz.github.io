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
We decided to analyze dataset (https://www.kaggle.com/rounakbanik/ted-talks) of 2550 TED-talks with 17 variables: 
name: The official name of the TED Talk. Includes the title and the speaker. Use this as the unique id in our dataframe
title: The title of the talk
main_speaker: The first named speaker of the talk
speaker_occupation: The occupation of the main speaker
num_speaker: The number of speakers in the talk
description: A blurb of what the talk is about
duration: The duration of the talk in seconds
event: The TED/TEDx event where the talk took place
languages: The number of languages in which the talk is available
film_date: The Unix timestamp of the filming
published_date: The Unix timestamp for the publication of the talk on TED.com
tags: The themes associated with the talk
views: The number of views on the talk
url: The URL of the talk
ratings: A stringified dictionary of the various ratings given to the talk (inspiring, fascinating, jaw dropping, etc.)
comments The number of first level comments made on the talk
related_talks A list of dictionaries of recommended talks to watch next
The data also includes transcripts of the talks, which we find useful.
Data is overall very clean: We have not found outliers. However, there are multiple steps of preprocessing and manipulations to the data that we have done in order to have new columns that will give us possibilities to explore the data in a greater depth. We have done / will do the following:
-extract the year of the event from the event name
-make a list of all occupations a speaker has 
-manually fill in the data for 6 speakers which have no occupation in the dataset (from wikipedia / official TED website)
-sanitize the occupations: cosider aggregating them for example “Artist”
-expand column ratings to multiple columns
-calculate number of words from transcript
-calculate the sensitivity 
-calculate speed of the speech = number of words divided by duration 



### Problematic

Our main goal for this project is to provide the user with interactive tools for exploring the talks. The visualizations focus on segmenting talks to different groups and finding relationships between them. We hope our visualization will provide some insight on how diffrent talk characteristics (speed, speaker occupation and gender, sentiment of the talk, TED-event of the talk, TEDx-boolean) correlate with:
the way the talk is perceived (whether it is funny/inspiring/courageous, or does the talk lack these ratings) and 
with the popularity of the talk (number of views and number of languages)

Besides exploring correlations, another main goal for visualizing the TED-talks is to look at the relationships between the lectures. We will find relationships between talks based on the “recommended talks” and “tags” columns.

After visualizing these relationships, the user can find interesting talks that are closely related on some arbitrary user-defined TED-talk. 

Visualizing this network of relationships will also help find if there are some clusters in the data. For example, as TED is an acronym for "Technology, entertainment, design", it would be interesting to see if there were some clustering of talks to these three dimensions.

In general, our project is focused to those that have general Our target audience are new university students, as visualizations of this project together with TED-talks could provide them some insight on how to give popular talks (high-school curriculum has a lack of self-expression and presentation skills). 
We also hope our project would reach those yet unfamiliar with TED and evoke them to start exploring the vast and free world of sophisticated and educational specialist presentations. 



### Exploratory Data Analysis

Jupyter notebook with eda:
how clean the data is, missing values
distributions of different variables - histograms, boxplots
correlation


Explore tags:
-Counts per tag,
-Histogram of number of tags by counts
-what are the 30 most popular tags?


Tags -> dictionary all talks
Take average of ratings of each tag



Notes:



### Related Work

####What others have already done with the data?
Data visualisation project by Yannick Pulver (https://yannickpulver.com/ivis/, 
https://github.com/yannickpulver/ivis-ted-visualization) is concentrating on presenting Ted Talks view counts as a “drop of sauce”. In his project, it is possible to filter data based on the topics and ratings of the speeches. On the side of the main graph, the project shows the division of ratings between projects, i.e., how big procent of the speeches included some certain rating. The third graph on the page concentrates on making sentiment analysis of the speeches based on their transcripts.

In his project (https://mef-bda503.github.io/pj-sevgilit/files/TED_Talks.html), Turkan Sevgili is doing exploratory data analysis for the Ted Talks data set with Python. The project includes graphs about “Top 10 Ted Speakers” in number of speeches held by a speaker, “Top 15 Occupations of the Speakers”, number of available languages for a speech, correlation between view counts and number of available languages for a speech, and correlation between comments and view counts.
Following links provide pretty thorough data analysis of the TED Talks data set: https://www.kaggle.com/lpang36/analysis-of-ted-talk-ratings and especially https://www.kaggle.com/anandaribeiro/understanding-ted-talks-ratings. The latter one concentrates on exploring the rating system in the data set and to find correlations between ratings and other dimensions in the data set. These analysis provide a profound foundation for our project and give us a good understanding of the data set that we’re working with.


#### Why is your approach original?
As showed above, there already exists analysis from the data set. However, we believe that we can provide even more information about the data set and especially, present the information in more informative way. Most of the analysis above present the information only in two-dimensional plotter, but we believe that we can visualize the data in more informative way and by that help the user to find correlations between factors that none of the projects so far has been able to do. Therefore, our approach in emphasizing the visuality of the data will help the end user to find new information from the data set in an easy way.
#### What source of inspiration do you take?
Our source of inspiration gems from beautiful and informative visualizations of data. As listed earlier in section “Methods”, there are lots of different kinds of possible data visualization graphs that we can use to plot different information from the data set. In addition, we will use the examples of earlier years as a source of inspiration for our final work.


In conclusion:

TED-data
https://www.kaggle.com/rounakbanik/ted-talks

Variables:
-Comments & number of views
-Duration
-Date of filming
-number of languages is available on
-ratings provide different categorizations (Funny, courageous, confusing etc)
-related talks + tags




## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**



###Tools to explore talks in general (correlations one could say)
-visualize most common tags with a bubble chart to illustrate that there are no large categories
-visualize correlation of performance with gender, profession, duration
-transcripts: Sentiment analysis, talking speed (number of words / duration)
Possible methods: parallel sets/ coordinates, Chord, Hierarchical edge building
-https://www.jasondavies.com/parallel-sets/  (discrete data sets)
-https://observablehq.com/@d3/parallel-coordinates (continuous data)
-https://www.data-to-viz.com/graph/chord.html or
-https://observablehq.com/@d3/hierarchical-edge-bundlingExplore characteristics
of good talks


### One-variable analyses
bubble plot based on some given variable (interactively choose from the following:
-number of times a tag is used
-frequencies of ratings
-frequencies of events


###We combine ratings, the number of comments the number of languages to a sum-variable "performance"
-Consider making performance discrete by taking 5% of the best ted talks as their own group.
-Study the group of subgroup of lecturers that have given more than one ted talk, and how do they differ from the rest / average


###Use ratings, tags, predefined related-talks as well as dictionary differences of transcripts to calculate a distance between all talks. Use this distance to populate force-directed-graph:
(perhaps euclidean distance)
-User can select his favorite talk and see what areas it is connected to    
-https://observablehq.com/@d3/force-directed-graph
-https://observablehq.com/@d3/disjoint-force-directed-graph


###events
-bubble chart to show main events
-Where are the smartest minds: Get location of each TED event, and look in what places have the best talks been performed
-https://bl.ocks.org/piwodlaiwo/3734a1357696dcff203a94012646e932
-http://bl.ocks.org/abenrob/c4ac3d581a7b16ff5f2f
-https://observablehq.com/@d3/orthographic-to-equirectangular
-https://observablehq.com/@d3/hexbin-map




## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

