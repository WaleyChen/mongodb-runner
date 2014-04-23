# /etc/init/mms-agent-automation-${PLAN}.conf
# logs to: /var/log/upstart/mms-agent-automation-${PLAN}.log
description "runs the automation agent for ${PLAN}"

version "1.0"

respawn
respawn limit 10 5

start on startup
stop on shutdown

script
  exec ${DEST}/agent/mongodb-mms-automation-agent -cluster=${DEST}/plans/${PLAN}.json;
end script

