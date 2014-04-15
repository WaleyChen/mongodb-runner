module.exports.MemberState = {
  STARTUP: 0,
  PRIMARY: 1,
  SECONDARY: 2,
  RECOVERING: 3,
  FATAL: 4,
  STARTUP2: 5,
  UNKNOWN: 6, // remote node not yet reached
  ARBITER: 7,
  DOWN: 8, // node not reachable for a report
  ROLLBACK: 9,
  SHUNNED : 10 //node shunned from replica set
};
