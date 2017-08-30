# Replicated chat

Real life distributed systems thinking doesn't happen in a vacuum: typically you are given an imperfect existing system and asked to improve it in some way that may require confronting some of the realities of distributed systems.

In this exercise, you are presented with a command line chat program that seems to generally work, but which was haphazardly coded without necessarily any consideration being given to replication. Your goal will be to increase fault tolerance, latency and throughput by way of replication.

## Exercise 1 - manual recovery from a backup

Currently, the server writes to a single copy of the database (a file). If this goes down we will be in trouble, particularly if we can't bring it back up!

Implement a system to _back up_ data to a secondary location, which we could manually switch over to if needed.


## Exercise 2 - single-leader replication with automatic failover

Our service has grown like crazy! We'd like multiple read replicas to handle the extra load, and would also like to minimize downtime through automatic failover. Implement a system for this.

Consider, what consistency guarantees would we like to make? Would this change if we had mutable data (say user statuses) rather than just append-only message data? Could we enforce uniqueness, for instance of usernames?


## Exercise 3 - multi-leader replication

Mo' growth mo' problems. We're now getting complaints from our Australian users that chat is always too slow. We're also nervous about power outages at our data center. Adapt the application to support a multi-datacenter configuration where each data center has its own leader.

What new problems does this introduce? Can we make the same consistency guarantees as before? We'd like to keep adding functionality to our application... what will be easy or hard given our new replication model?
