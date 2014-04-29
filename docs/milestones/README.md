# milestones

## strategy

- 1 headline feature per release
- stay small
- build and launch server features first
- allows testing and refinement IRL before committing to UI
- provide the tool to hack lots of ui prototypes
- shapes server features of the following release
- highest priority server work -> be used to build the biggest user features


## tldr

1. get the model, auth and deployment right
2. hit the features checklist
3. components that make you forget you're using a database

## short-term

### 0.1.0: deployment

**feature** explore deployments
server init + read api parity

- model
- auth
- stream
- Deployment

### 0.2.0: prepare

**feature** autoupdate
**server** write api parity

- CRUD: document, index, collection database
- ui autoupdate


## menu

### 0.x.0: metrics

**feature** statistics for everything, streaming, beautiful
**server dependencies** combine top and metrics to be a single consumable

- mongotop + mongostat + even more serverStatus
- user defined expressions
- currentOp

### 0.x.0: sparkle

**feature** shell
**server dependencies** read api parity, write api parity
**server** tbd

- autocomplete
- parser
- evaluator

### 0.x.0: security administration

**feature** a delightful ui for application security
**server dependencies** read api parity, write api parity

- view and edit roles and users
- create role wizard

### 0.x.0: profiling

**feature** improve your application
**server dependencies** read api parity

- profiling viewer

### 0.x.0: aggregation

**feature** aggregation ui
**server dependencies** aggregation

- definition
- validator
- view results

### 0.x.0: connect

**feature** collection from url/upload
**server dependencies** importer

- pipeline definition
- file upload

### 0.x.0: charts

**feature** visualize results
**server dependencies** read api parity

- histogram
- bubble time series
- donut
- binning/scatter

### 0.x.0: charts 2

**feature** even more ways to visualize your data
**server dependencies** read api parity

- tree
- cluster
- map

### 0.x.0: mms

- backup up and automation sells
- cluster administration handled by mms automation
- 1 click -> add mms to your deployment (create account/group/configure/etc should be 1 step where you just enter an email address)


### 0.x.0: planner

**feature** capacity planning and forecasting
**server dependencies** collection sampling

- serverStatus: working set, index, memory stats
- collection density

### 0.x.0: deployment report

**feature** static report of deployment health
**server dependencies** ?


### 0.x.0: support easy-button

**feature** 1 click -> generate & send deployment report
**server dependencies** ?

- collect, package and send to support


## pending

- stale lock cleanup
- chunk distribution analysis

### completed

- [0.0.4 - replication](./milestones/004-replication.md)
- [0.0.3 - auth](./milestones/003-mvp.md)
- [0.0.1 - mvp](./milestones/001-mvp.md)
- [0.0.0 - sketch](./milestones/000-sketch.md)
