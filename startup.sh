#!/bin/bash

# start up supervisord, all daemons should launched by supervisord.
/usr/bin/supervisord -c /root/supervisord.conf

# start a shell
/bin/bash && vi ./tmp.sh
