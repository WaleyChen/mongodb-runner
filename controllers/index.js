module.exports = {
  info:  new (require('./diagnostics'))(),
  databases:  new (require('./databases'))(),
  log: new (require('./log'))(),
};
