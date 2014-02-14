# Tasks

> @note Integrate from [diagnosing performance issues][diagnosing-performance]

##  Context

You open mongoscope on [localhost](http://localhost:28017).  What actions
do you need to take?

## Instance

For the instance running on `localhost`, mongoscope should:

- show it's OS and version
- show it's last 50 lines of log output
- show IO timing by read + write = total (`mongotop`) for all namespaces and
  databases
- show very fine-grained statistics (`mongostat`)
- show stats for the estimated working set of the entire dataset
- show a link to it's metrics in MMS

> _@todo_ What should be considered relevant stats?

## Deployment

For the MongoDB deployment `localhost` is a member of, mongoscope should:

- show a list of all users and roles
- consider the following as relevant stats:
  - number of documents
  - total size on disk
  - lock percentage
  - padding factor
- show relevant stats for all databases, collections, and indexes

> _@todo_ Need better taxonomy for padding factor.  Other stats to include?

## Replica Set

For the replica set `localhost` is a member of, mongoscope should:

- show the replica set configuration
- show it's current role in the replica set (e.g. secondary, primary)

> _@todo_ What should be considered relevant stats?

## Sharded Cluster

For the sharded cluster this instance is a member of, mongoscope should:

- it's sharding configuration
- relevant stats about it's shard

> _@todo_ What should be considered relevant stats?

[diagnosing-performance]: http://docs.mongodb.org/manual/administration/monitoring/#diagnosing-performance-issues
