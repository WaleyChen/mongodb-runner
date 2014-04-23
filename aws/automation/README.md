To create a nice base MongoDB installation using MMS automation, just run
`bash install.sh` which should print out some nice info for you:

```
An upstart job has been created for your new cluster and placed in
/home/ubuntu/.mongodb/mms/upstart/mms-agent-automation-quickstart.conf.

The upstart job will make sure the agent for your cluster is started when
you restart your server.  To register this job and start the agent:

  sudo ln -s /etc/init/mms-agent-automation-quickstart.conf /home/ubuntu/.mongodb/mms/upstart/mms-agent-automation-quickstart.conf;
  sudo start mms-agent-automation-quickstart;

Once the agent has converged, you will have two users for your shiny new deployment.

  mongo 127.0.0.1:3017/admin -u ubuntu -p vMERKng6JWlgs61x

To create or modify users, the agent will also create a root user for you.
Like all things root, use sparingly and keep it safe.

  mongo 127.0.0.1:3017/admin -u root -p YLBDLxffTeiWSAsc

For testing, you can start the automation agent in the foreground with:

  /home/ubuntu/.mongodb/mms/agent/mongodb-mms-automation-agent -cluster=/home/ubuntu/.mongodb/mms/plans/quickstart.json;
```
