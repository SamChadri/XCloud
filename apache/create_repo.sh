#! /usr/bin/bash

X_USER = $1
X_PASSWD = $2

svnadmin create /var/svn/repos/xcloud_users/$X_USER

sed '/authz-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf
sed '/password-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf

echo "${X_USER} = ${X_PASSWD}" >> /var/svn/repos/xcloud_users/$X_USER/conf/passwd 

svnserve -d -r /var/svn/repos/xcloud_users/$X_USER 
