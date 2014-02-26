# Notes Aggregation

Just some things to help me reason about how aggregation works, little code
that helped along the way which might end up as a fun SkunkWork project.

## [user analysis](http://docs.mongodb.org/master/tutorial/aggregation-with-user-preference-data/)

given a users collection

```
db.users.insert({
  _id : "jane",
  joined : ISODate("2011-03-02"),
  likes : ["golf", "racquetball"]
});
```

#### `mongo-naturalish.js`

```javascript
mongo.save('users', 'jane', {
  joined: new Date('2011-03-02'),
  likes: ['golf', 'racquetball']
});
```

#### natural language

```
Jane joined on March 2nd 2011 and likes golf and racquetball.
```

### signups by month

```
db.users.aggregate(
  [
    { $project : { month_joined : { $month : "$joined" } } } ,
    { $group : { _id : {month_joined:"$month_joined"} , number : { $sum : 1 } } },
    { $sort : { "_id.month_joined" : 1 } }
  ]
)
```

#### `mongo-naturalish.js`

```javascript
report('signups by month').from('users').each(function(user, report){
  report.month_joined = user.joined.getMonth();
}).sum('month_joined').generate();
```

```coffeescript
report 'signups by month'
  .from 'users'
  .each -> user, report
    report.month_joined = user.joined.getMonth()
  .sum('month_joined')
  .generate()
```

Which of course requires some annotation to understand in [mongodb-land][mongodb-land].

```javascript
// Applies BDD style "Background" for an aggregation pipeline.
mongo.toReport('signups')
  // Creates a `/^{{expr}}/i: {{collection name}}` mapping
  // so we have `/^signups/i: users` == any time `mongo.report` is called,
  // if the report name matches any of these mappings, apply these properties
  // just before validating/generating/submitting.
  .use('users');

// @note assuming we have access to ES6 Proxy.
// `new Report('signups by month')`
// report.collection = 'users';
// report.query = {};
mongo.report('signups by month')
  // creating a `$group` expression naturally maps to `Array.each/map/forEach`
  .each(function(user, report){
    report.month_joined = user.joined.getMonth();
    // ReportProxy and DocumentProxy setters/getters give us:
    // report.query = {$project: {month_joined: {$month: '$joined'}}};
  })
  .sum('month_joined')
  report.query = {
    $project: {month_joined: {$month: '$joined'}}},
    $group: {_id: {month_joined: '$month_joined'} , number: {$sum: 1 }}
    $sort : {'_id.month_joined': 1}}
  };
  // Validate and generate the actual bson pipelines.
  .generate();
```

#### natural language

```
To generate the signups by month report, group users by the month they joined.
```

[mongodb-land]: http://mongodb.land

## mongo-naturalish class stub

```javascript
function Report(name){
  this.name = name;
  this.query = {$project: {}, $group: {}, $sort: {}};
  this.applyBackground();
}

Report.prototype.each = function(fn){
  var report = new ReportProxy(this),
    doc = new DocumentProxy(this);
  fn(doc, report);
  return this;
};

Report.prototype.sum = function(key){
  this.query.$group[key] = { $sum : 1 };
  this.query.$sort = {};
  this.query.$sort['_id.' + key] = 1;
  return this;
};

Report.prototype.generate = function(){
  // magically validate and execute the aggregation.  unicorns.
};

function DocumentProxy(report){
  this.report = report;
}
// This is probably mixed up a bit with ReportProxy, but getting this all down
// is already taking too long
DocumentProxy.prototype.set = function(as, keyProxy){
  this.report.query.$project[as] = keyProxy.unwind();
  this.report.query.$group = {_id: {}};
  this.report.query.$group._id[as] = '$' + as;
};

DocumentProxy.prototype.get = function(key){
  return new KeyProxy(key);
};

function KeyProxy(key){
  this.key = key;
  this.op = null;
}

KeyProxy.prototype.getMonth = function(){
  this.op = '$month';
};

KeyProxy.prototype.unwind = function(){
  var q = {};
  q[this.op] = '$' + this.key;
  return q;
};
```
