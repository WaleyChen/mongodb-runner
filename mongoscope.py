import requests
import json

_host = 'http://localhost:29017'

_token = None
_token_refresher = None

def connect(seed):
    '''
    Get a new token for a seed
    '''
    url = '%s/api/v1/token' % (_host)

    res = requests.post(url, params={'seed': seed},
        headers={'Accept': 'application/json'})

def _get(*parts, **params):
    url = '%s/api/v1/%s' % (_host, '/'.join(parts))
    headers = {
        'Authorization': 'Bearer %s' % (_token),
        'Accept': 'application/json'
    }
    return requests.get(url, params=params, headers=headers).json

def deployments():
    return _get()

def instance(uri):
    return _get(uri)

def ops(uri):
    return _get(uri, 'ops')

def oplog(uri):
    return _get(uri, 'oplog')

def metrics(uri):
    return _get(uri, 'metrics')

def profiling(uri):
    return _get(uri, 'profiling')

def database(uri, database_name):
    return _get(uri, database_name)

def collection(uri, database_name, collection_name):
    return _get(uri, database_name, collection_name)

def find(uri, database_name, collection_name, where={}, limit=10, skip=0, explain=0):
    return _get(uri, database_name, collection_name, 'find',
        where=json.dumps(where), limit=limit, skip=skip, explain=explain)

def count(uri, database_name, collection_name, where={}, explain=0):
    return _get(uri, database_name, collection_name, 'count',
        where=json.dumps(where), explain=explain)

def aggregate(uri, database_name, collection_name, pipeline):
    return _get(uri, database_name, collection_name, 'aggregate',
        pipeline=json.dumps(pipeline))

def log(uri):
    return _get(uri, 'log')

def top(uri):
    return _get(uri, 'top')

def replication(uri):
    return _get(uri, 'replication')

def sharding(uri):
    return _get(uri, 'sharding')
