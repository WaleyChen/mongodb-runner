module.exports = {
  _id: 2,
  seed: 'mongodb://localhost:28017',
  name: 'exfm',
  instances: [
    {
      _id: 2,
      name: 'localhost-1',
      url: 'mongodb://localhost:28017',
      version: '2.6.0',
      platform: 'linux',
      state: 'primary',
      sampled_at: 1398117273696,
      rs: 'exfm',
      connections: {
        1: Object,
        2: Object
      }
    },
    {
      _id: 3,
      name: 'localhost-2',
      url: 'mongodb://localhost:28018',
      version: '2.6.0',
      platform: 'linux',
      state: 'secondary',
      sampled_at: 1398117273696,
      rs: 'exfm',
      connections: {
        3: Object,
        4: Object
      }
    },
    {
      _id: 4,
      name: 'localhost-3',
      url: 'mongodb://localhost:28019',
      type: 'arbiter',
      version: '2.6.0',
      platform: 'linux',
      state: 'arbiter',
      sampled_at: 1398117273696,
      rs: 'exfm',
      connections: {}
    }
  ]
};
