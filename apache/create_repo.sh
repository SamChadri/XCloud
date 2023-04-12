#! /usr/bin/bash

X_USER=$1
X_PASSWD=$2

echo "Creating SVN REPO for USERNAME : $X_USER"  

mkdir /var/svn/repos/xcloud_users/$X_USER

svnadmin create /var/svn/repos/xcloud_users/$X_USER

echo "Created user repo at /var/svn/repos/xcloud_users/$X_USER"

sed '/authz-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf
sed '/password-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf

echo "${X_USER} = ${X_PASSWD}" >> /var/svn/repos/xcloud_users/$X_USER/conf/passwd 

svnserve --listen-port=$SVN_PORT  -d -r /var/svn/repos/xcloud_users/$X_USER


echo "Started SVN server on port $SVN_PORT" 

NEW_PORT=$((SVN_PORT + 1))

export SVN_PORT=NEW_PORT 
