#!/usr/bin/env bash
set -e;

BASE=~/.mongodb;
DEST=$BASE/mms;
REV="0.3.5.220-1";
PLATFORM="linux"; # @todo: use `uname` instead
BUNDLE="mongodb-mms-automation-agent-${REV}.${PLATFORM}_x86_64";
FILENAME="${BUNDLE}.tar.gz";

DL=https://mms.mongodb.com/download/agent/automation/$FILENAME;

mkdir -p $DEST/.versions $DEST/plans $DEST/upstart;

wget --quiet $DL;
tar xvzf "${FILENAME}" > /dev/null;
mv $BUNDLE $DEST/agent;
rm "${FILENAME}";

PLAN="quickstart";

mkdir -p "$BASE/data-${PLAN}";
PORT=3017;
HOST=127.0.0.1;

ROOT_PASS=`< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-16};echo;`;
ROOT_USER=root;

USER_PASS=`< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-16};echo;`

cat > $DEST/plans/${PLAN}.json << EOF
{
  "version": 1,
  "processes": [{
      "name": "quickstart",
      "processType": "mongod",
      "version": "2.6.0",
      "args2_6": {
          "storage" : {
              "dbPath": "$BASE/data-${PLAN}"
          },
          "auth": true,
          "net" : {
              "port": $PORT,
              "bind_ip": "$HOST"
          }
      }
  }],
  "auth": {
    "usersWanted" : [
      {
        "db" : "admin",
        "user" : "$ROOT_USER",
        "roles" : [ "root" ],
        "initPwd" : "$ROOT_PASS"
      },
      {
        "db" : "admin",
        "user" : "$USER",
        "roles" : [ "dbOwner" ],
        "initPwd" : "$USER_PASS"
      }
    ]
  },
  "options": {
      "downloadBase": "$DEST/.versions"
  },
  "systemLog" : {
    "destination" : "file",
    "path": "$BASE/${PLAN}.log"
  },
  "mongoDbVersions": [
    {
      "name" : "2.6.0",
      "builds" : [
          {
            "platform" : "osx",
            "url": "http://fastdl.mongodb.org/osx/mongodb-osx-x86_64-2.6.0-rc2.tgz",
            "gitVersion" : "d44539de6758237c8b6eaa57a59988fa5b6ef9ac",
            "bits" : 64
          },
          {
            "platform" : "linux",
            "url": "http://fastdl.mongodb.org/osx/mongodb-linux-x86_64-2.6.0.tgz",
            "gitVersion" : "1c1c76aeca21c5983dc178920f5052c298db616c",
            "bits" : 64
          }
      ]
  }]
}
EOF


cat > ${DEST}/upstart/mms-agent-automation-${PLAN}.conf << EOF
# /etc/init/mms-agent-automation-${PLAN}.conf
# logs to: /var/log/upstart/mms-agent-automation-${PLAN}.log
description "runs the MongoDB MMS automation agent for ${PLAN}"

version "1.0"

respawn
respawn limit 10 5

start on startup
stop on shutdown

script
  exec ${DEST}/agent/mongodb-mms-automation-agent -cluster=${DEST}/plans/${PLAN}.json;
end script
EOF

cat << EOF
An upstart job has been created for your new cluster and placed in
${DEST}/upstart/mms-agent-automation-${PLAN}.conf.

The upstart job will make sure the agent for your cluster is started when
you restart your server.  To register this job and start the agent:

  sudo ln -s /etc/init/mms-agent-automation-${PLAN}.conf ${DEST}/upstart/mms-agent-automation-${PLAN}.conf;
  sudo start mms-agent-automation-${PLAN};

Once the agent has converged, you will have two users for your shiny new deployment.

  mongo ${HOST}:${PORT}/admin -u ${USER} -p ${USER_PASS}

To create or modify users, the agent will also create a root user for you.
Like all things root, use sparingly and keep it safe.

  mongo ${HOST}:${PORT}/admin -u ${ROOT_USER} -p ${ROOT_PASS}

For testing, you can start the automation agent in the foreground with:

  $DEST/agent/mongodb-mms-automation-agent -cluster=$DEST/plans/${PLAN}.json;
EOF
