port = {{port}}
dbpath=/home/ubuntu/mongodb/data/{{name}}
logpath=/home/ubuntu/mongodb/log/{{name}}.log
verbose = true
nohttpinterface = true
cpu = true
logappend=true
{% if replset %}
replset = {{replset}}
{% endif %}
{% if auth %}
auth=true
{% endif %}
