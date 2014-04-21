# /etc/init/mongoscope.conf
description "run mongoscope demo"

version "1.0"

emits mongoscope_starting
emits mongoscope_running

# configuration variables.
env NODE_ENV=production
env service_name=mongoscope
env SERVICE_HOME=/home/ubuntu/mongoscope

respawn
respawn limit 10 5

pre-start script
    chdir $SERVICE_HOME
    exec /usr/bin/npm install --production
    emit mongoscope_starting
end script

script
    chdir $SERVICE_HOME
    exec /home/ubuntu/mongoscope/bin/mongoscope.js >> /home/ubuntu/mongoscope/upstart.log 2>&1
    emit mongoscope_running
end script
