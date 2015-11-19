#!/bin/bash

# prepare ssh server
mkdir -p /var/run/sshd

# start up supervisord, all daemons should launched by supervisord.
/usr/bin/supervisord -c /root/supervisord.conf

# start a shell
/bin/bash

# open google chrome
/bin/bash google-chrome-stable --user-data-dir=/root
#google-chrome-stable
