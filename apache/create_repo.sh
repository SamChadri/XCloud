#! /usr/bin/bash

X_USER=$1
X_PASSWD=$2



echo "Creating SVN REPO for USERNAME : $X_USER"  

cd /var/svn/repos/xcloud_users/

svnadmin create $X_USER

echo "Created user repo at /var/svn/repos/xcloud_users/$X_USER"

sed '/authz-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf
sed '/password-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf

echo "${X_USER} = ${X_PASSWD}" >> /var/svn/repos/xcloud_users/$X_USER/conf/passwd 



