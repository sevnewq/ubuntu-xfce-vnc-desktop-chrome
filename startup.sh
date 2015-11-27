#!/bin/bash

# prepare ssh server
mkdir -p /var/run/sshd

# start up supervisord, all daemons should launched by supervisord.
/usr/bin/supervisord -c /root/supervisord.conf

#google-chrome-stable --user-data-dir=/root --window-position=0,0 --window-size=1024,768 --force-device-scale-factor=1 --no-default-browser-check --no-first-run --load-extension=/root/ext --disable-translate

# start a shell
/bin/bash && vi ./tmp.sh
