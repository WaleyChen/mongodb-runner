# "Progressive Scan"

Consider the following features which require a full table scan:

- get a list of all keys to populate options in a select input
- provide a search autocomplete by faceting values given a key
- get the size of each document
- determine the sparseness of a collection

This is a [timsort problem](http://svn.python.org/projects/python/trunk/Objects/listsort.txt):
easy if you have a few thousand documents, impossible at scale.  So consider
population modeling and sampling.

Use reservoir sampling against chunks of a collection -> build a view of the
population that increases in resolution over time.

Don't need to look at every document to figure out what's going on, in fact
would work against you in most situations.  Imagine of you could open an
excel spreadsheet with 100 million rows in a single spreadsheet.  Not a good
way to do analysis, but a good way to set a processor on fire.


## Links

- [Boids (Flocks, Herds, and Schools: a Distributed BehavioralModel)](http://www.red3d.com/cwr/boids/)
- [paperjs flocking example](https://github.com/Takazudo/paperjs-flocking-example)
- [Neat Algorithms - Flocking](http://harry.me/blog/2011/02/17/neat-algorithms-flocking/)
- [Ant colony optimization algorithms](http://en.m.wikipedia.org/wiki/Ant_colony_optimization)
- [Weighted random sampling with a reservoir](http://dl.acm.org/citation.cfm?id=1138834)
- [Scalable K-Means++](http://arxiv.org/abs/1203.6402)
- [Markov chain Monte Carlo](http://en.m.wikipedia.org/wiki/Markov_chain_Monte_Carlo)
- [Gibbs sampling](http://en.m.wikipedia.org/wiki/Gibbs_sampling#section_4)
- [Nested sampling algorithm](http://en.m.wikipedia.org/wiki/Nested_sampling_algorithm)
- [Through a Table, Sparsely](http://blog.memsql.com/through-a-table-sparsely/)

## Scribbles

- what db visualizations are already culturally embedded in target personas?
    - looking at top output
- fast passes of document size aggregated in a scatter plot possible but not scan everything
- increase resolution over time allows users to stop when they want
- build bubble chart over time -> allows scrubbing back, but doesn't hinder heads up view
- each stat like an amoeba under a microscope
- values are all percentage based? -> learned perception visualized rather than
- the user having to do it on there own ( eg look for high values and magically
- track their deltas in memory)
- computed stats encompass component bubbles -> eg lock bubble contains read and write bubbles
