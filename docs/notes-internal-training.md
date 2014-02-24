# Notes from Internal Training

- Internal data structure
  - Doubly linked list
  - not our friend -> poor observability
  - great -> fast
- Taxonomy problems
  - Lock vs Latch
    - Lock is very emotionally charged work in DBA and DevOps -> heavyweight,
      stop the world
    - Mongo actually uses Latch -> lightweight, micro-transactions
  - Upgrade vs Apply Patch
  - Hard to explain components:
    - mongos -> "nope, not multiple mongo instances.  like a load balancer for
      shards"
    - config servers are replica sets?  -> nope they're this different thing
    - need a *standard visual language* -> differentiate by shape
- Desperate need to validated and maintained scripts for support
- Want a "stop light" summary of instance state
- Stats to look at:
  - Lock % -> schema issue?
  - Page Faults (especially hard faults) -> not enough ram?
  - iostat tea leaf reading -> disk problem?
  - Replication lag -> network or machine config problems?
  - Changes in connection and cursor counts -> firewall or app problem?
    - eg app retrying on exception caused by firewall being too restrictive
  - Collection stats
    - padding factor thrash -> moving lots of documents -> schema issue?
- Questions you might want to ask about a deployment:
  - "How much RAM do I need?"
  - "What's the working set size?"
  - "How can I access my data access patterns?"
    - distribution of document sizes?
    - hot documents?
    - hot collections?
  - "Are my secondaries keeping up with my primary?"
  - "Is my schema good or bad (probably) and how do I fix it quickly?"
  - "Is there a physical disk issue and are the disks configured correctly?"
  - "Am I under-utilizing my hardware?"
  - "Is the operating system misconfigured?"
  - "Is a mongodb component configured correctly?"
- Questions circle around
  - physical state and configuration of hardware, network, operating system
  - schema design
  - application logic
  - capacity planning and sizing

  ## Summary

  Things to focus on

  - observability and visualization of
    - schema
    - data set
    - security
  - reusable and maintained tooling
  - taxonomy refinement and visual enforcement
