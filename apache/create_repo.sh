#! /usr/bin/bash

X_USER=$1
X_PASSWD=$2



echo "Creating SVN REPO for USERNAME : $X_USER"  

cd /var/svn/repos/xcloud_users/

svnadmin create $X_USER

echo "Created user repo at /var/svn/repos/xcloud_users/$X_USER"

sed '/auth-access =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf
sed '/authz-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf
sed '/password-db =/s/^#//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf

sed 's/^[ \t]*//;s/[ \t]*$//' -i /var/svn/repos/xcloud_users/$X_USER/conf/svnserve.conf

echo "${X_USER} = ${X_PASSWD}" >> /var/svn/repos/xcloud_users/$X_USER/conf/passwd 

touch /var/svn/repos/xcloud_users/$X_USER/conf/passwd_apache

htpasswd -b /var/svn/repos/xcloud_users/$X_USER/conf/passwd_apache ${X_USER} ${X_PASSWD}

echo "[/]" >> /var/svn/repos/xcloud_users/$X_USER/conf/authz

echo "${X_USER} = rw" >> /var/svn/repos/xcloud_users/$X_USER/conf/authz

echo "export USER=${X_USER}" >> /root/.bashrc

echo "export USER=${X_USER}" >> /root/.profile

source /root/.bashrc

source /root/.profile
