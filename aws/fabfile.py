from fabric.api import env, get, put, sudo
from fabric.contrib.files import append, upload_template

env.username = 'ubuntu'

def bootstrap():
    sudo('apt-get install -y software-properties-common python-software-properties')
    sudo('apt-add-repository -y ppa:chris-lea/node.js')

    sudo('apt-get install -y nodejs')

    sudo('apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10')
    sudo('echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart '
      'dist 10gen" | sudo tee /etc/apt/sources.list.d/mongodb.list')
    sudo('apt-get update')
    sudo('apt-get install mongodb-10gen')

    put('./startup.sh', '/home/ubuntu/startup.sh', mode=0777)
    put('./etc/rc.local', '/etc/rc.local', mode=0777)

    sudo('mkdir -p /home/ubuntu/mongodb')
    sudo('chown -R mongodb:mongodb /home/ubuntu/mongodb')

@task
def bootstrap_ebs():
    sudo('apt-get install -y xfsprogs')
    sudo('mkdir -p /ebs/mongoscope/mongodb')
    sudo('mkfs.xfs /dev/xvdf')
    fs_tab = '/dev/xvdf    /ebs/mongoscope   xfs defaults,nobootwait,noatime 0   0'

    append('/etc/fstab', fs_tab, use_sudo=True)

    sudo('mount -a')
    sudo('chown mongodb:mongodb /ebs/mongoscope/mongodb')


def add(name, port, replset=None, auth=False):
    ctx = {'name': name, 'port': port, 'replset': replset, 'auth': auth}

    upload_template('mongod-upstart.tpl', '/etc/init/mongodb{}'.format(name), ctx,
      use_jinja=True, mirror_local_mode=True, use_sudo=True, template_dir='./')

    upload_template('mongod-config.tpl', '/etc/init/mongodb{}'.format(name), ctx,
      use_jinja=True, mirror_local_mode=True, use_sudo=True, template_dir='./')

    sudo('ln -s /ebs/mongoscope/mongodb/{name} /home/ubuntu/mongodb/{name}'.format(
      name=name))

    sudo('chown -R mongodb:mongodb /ebs/mongoscope/mongodb')
    sudo('chown -R mongodb:mongodb /home/ubuntu/mongodb')
