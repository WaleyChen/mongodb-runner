# 1.0.0

> TBD

## Deliverables

- [x] server: cr-based authentication
- [x] server: complete, web-friendly read-only rest api
- [ ] ui: deployments: connect to deployment
- [ ] ui: deployments: view details (replication and sharding status
- [ ] ui: deployments: easily view details for any instance
- [ ] ui: deployments: connect to another deployment
- [ ] ui: instance: view host and build details
- [ ] ui: instance: view log
- [ ] ui: instance: view top
- [ ] ui: instance: view databases w/ high-level stats
- [ ] ui: instance: view collections w/ high-level stats
- [ ] project: deployment setup
- [ ] project: ground-work for qa and documentation

## Punchlist

- [x] server: url vs. id vs. name cleanup
- [x] server: dns disambiguation
- [ ] server: connecting automatically figures out the right deployment you want instead of creating a new one
- [ ] server: connect to rs that is actually a cluster -> connect to cluster -> merges the two deployments
- [ ] server: when a replicaset membership event happens, update the deployment
- ui
  - [ ] dumb down ui even further
  - [ ] starting view for cluster
  - [ ] starting view for replica set
  - [ ] starting view for standalone
  - [ ] bug: instance list stomped when switching in ui
- project
  - [ ] jira
  - [ ] roadmap
  - [ ] setup mci project
  - [ ] automated build deploy for windows, nix, and osx

