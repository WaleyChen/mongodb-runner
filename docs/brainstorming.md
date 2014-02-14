# Brainstorming

## "The Ultimate MongoDB Demo"

- realtime stream processing from mongoscope

## Hacker Shell

- autocompletion with doc strings
- make more iPython like?
- displaying results in ACE?
- custom syntax highlighting for ACE http://ace.c9.io/#nav=higlighter
- distraction-free/Zen mode?
- pull more from Tyler's mongo hacker shell repo

## Script Party

- paste and run Github gist
- create/edit/save user scripts from shell
- see the amazing http://bl.ocks.org/ for D3 or any of the JSBin/CodePen/RequireBin
- creates community around scripts
- way to "officialize" support scripts

## EKG

- EKG-like viz of instance health fills header and provides background
- Full-screen/dim-the-lights-mode: just EKG and hostname on dark background
- Is something is wrong, background flashing red
- This is going to be fucking rad as a Phonegap app

## MongoDB University integration

- Use the shell as a tutorial/wizard-mode?
- "Install mongodb" -> click here to launch mongoscope shell in fullscreen
  mode

## Easy Button

- visualization for [dex](https://github.com/mongolab/dex)
- detect and automatically fix schema problems before they happen
- munge, anonymize and send logs to MongoDB Support with one click

## Aggregation Visualizer

- aggregation pipeline builder more like yahoo pipes?
- don't make me guess based on stats when things are starting and stopping

## MongoDBSpeed

- Graded Health based on best practices
- What would [YSlow!](http://developer.yahoo.com/yslow/) or
  [PageSpeed](https://developers.google.com/speed/pagespeed/) grading
  rules be for a instance?

## Emscripten

- Cross-compile parts of C++ source w/ emscripten
- When we're able to actually edit the instance state, there is 0 room for error
- Really just want business logic from C++
- Validate changes entirely on the client-side
- No surprises from JS validation library bugs
- Confidently queue changes on the client -> apply all at once -> have no
  doubt they will absolutely work
- Eliminate guess work on the operator and support side
- Remove a ton of duplicate code from the face of the earth (see all of
  the mock `mongod` projects)

## Tach

- Like on a jet-powered drag-racer
- Make photoshop gauges real
- Useful for all kinds of things like Lock percentage?
- Way to quantify instance health as 0-100?
