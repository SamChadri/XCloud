#!/bin/bash

svnserve  -d -r /var/svn/repos/xcloud_users/

apache2ctl -D FOREGROUND

