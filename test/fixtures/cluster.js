module.exports = {
  _id: 3,
  seed: 'mongodb://localhost:29017',
  name: 'wikipedia',
  sharding: {
    'wikipedia.pages': [{_id: 1}],
  },
  instances: [
    {
      _id: 5,
      name: 'localhost-1',
      url: 'mongodb://localhost:29017',
      version: '2.6.0',
      platform: 'linux',
      state: 'primary',
      sampled_at: 1398117273696,
      rs: 'songs1',
      shard: 'shard0000',
      connections: {
        5: Object,
        6: Object
      }
    },
    {
      _id: 6,
      name: 'localhost-2',
      url: 'mongodb://localhost:29018',
      version: '2.6.0',
      platform: 'linux',
      state: 'secondary',
      sampled_at: 1398117273696,
      rs: 'songs1',
      shard: 'shard0000',
      connections: {
        7: Object,
        8: Object
      }
    },
    {
      _id: 7,
      name: 'localhost-3',
      url: 'mongodb://localhost:29019',
      version: '2.6.0',
      platform: 'linux',
      state: 'primary',
      sampled_at: 1398117273696,
      rs: 'songs2',
      shard: 'shard0001',
      connections: {}
    },
    {
      _id: 8,
      name: 'localhost-4',
      url: 'mongodb://localhost:29020',
      version: '2.6.0',
      platform: 'linux',
      state: 'secondary',
      sampled_at: 1398117273696,
      rs: 'songs2',
      shard: 'shard0001',
      connections: {}
    },
    {
      _id: 9,
      name: 'localhost-5',
      url: 'mongodb://localhost:29030',
      type: 'router',
      version: '2.6.0',
      platform: 'linux',
      connections: {}
    },
    {
      _id: 10,
      name: 'localhost-6',
      url: 'mongodb://localhost:29031',
      type: 'router',
      version: '2.6.0',
      platform: 'linux',
      connections: {}
    },
    {
      _id: 20,
      name: 'config-1',
      url: 'mongodb://localhost:30017',
      version: '2.6.0',
      platform: 'linux',
      type: 'config'
    },
    {
      _id: 21,
      name: 'config-2',
      url: 'mongodb://localhost:30018',
      version: '2.6.0',
      platform: 'linux',
      type: 'config'
    },
    {
      _id: 22,
      name: 'config-2',
      url: 'mongodb://localhost:30019',
      version: '2.6.0',
      platform: 'linux',
      type: 'config'
    }
  ]
};
