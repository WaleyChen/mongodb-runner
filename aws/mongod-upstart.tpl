# mongodb{{name}}
description "run mongodb with the {{name}} config"
version "1.0"
script
    start-stop-daemon --start --quiet --chuid mongodb --exec  /usr/bin/mongod -- --config /home/ubuntu/mongodb/{{name}}.conf
end script
