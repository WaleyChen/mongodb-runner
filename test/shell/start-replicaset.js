var opts = {};
var instances = opts.instances || 3,
  name = 'replicacom' || opts.name,
  rs = new ReplSetTest({name: name, nodes: instances, useHostName: false, startPort: 6000});
rs.startSet();
rs.initiate();
