Take the votes, rate the meps and parties based on these votes

#Voted items
MEPs can be asked to vote on a complete report, a single amendment, a bunch of amendments put together or part of an amendment (split). Until we find a better name, it's what we call voted items.

A scorecard takes several of these items and analyse how the MEPs voted. Some got a broad consensus and most of the parliament voted the same, some were more controversial and they passed or failed by a few votes. Obviously, how each MEP vote on a controversial vote has a bigger impact, as a few votes can tip the result in one way or another. On a scorecard, we rank them, give a weight or 1 to the more consensual up to 2 for the most controversial.

#Score calculation

##MEP score
For each voted item (amendment, report..), an MEP can vote yes, no, abstain or being absent (1,-1,0,<empty> in the csv). If she/he votes what we recommended, it's a point, if against -1. We multiply each by the weight of the voted item to calculate their position. 

We then rank all the MEPs, give a score of 0 for the worse, and 100 to the best. A score of 100 doesn't mean they voted to all the votes the way we recommended. It just mean it's the best we got. It's the same for a score of 0, it's not 100% doing the opposite of our recommendation, but it's the furthest.

## Party/Group/Country score
We take the score of each MEP that belong to the party/group/country and calculate the average. 

It means that a party with two MEPs, one that voted once only, say against our recommendation and the other that voted all the time following the recommendation will have the same weight and the party score will be average.

It's simplier to explain (and calculate) as the focus is on the seat, not on each vote, but might seem unfair for the MEP that is the most active. The solution would be that MEPs votes all the time.

You might notice when you explore the data that some MEPs from the same party belong to different group. Welcome to European politics.

#Effort/Laziness

For each mep, we give one point if he voted for or against (no matter what we recommend), and zero otherwise and divide it by the number of votes he attended. So an MEP that votes yes or no all the time will get a 100% effort, one that always abstain or doesn't vote a 0.

We then calculate the effort of the party based on the average of their MEPs.

_This score is going to be fine tuned once we can have a better distinction between justified abscence (eg. illness) or when he was absent because he was at the cafeteria._

#Graphs
##country bar chart
The height represent the number of MEPs, the color its score (gradient from deep red 0 to dark green 1)

##Groups pie chart
Each slide is the number of MEPs

##Score bar chart
How the MEPs are ranked from 0 to 100. The higher the bar, the more meps got the same score.
The average is displayed as the big number.

##Party bubble chart
Each party is a bubble, the biggest the more meps. The worst one on the left and red, The best on the right and green.

The height is the laziness, so the more their meps voted, the higher they are.



