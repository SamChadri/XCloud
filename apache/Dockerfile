FROM ubuntu:18.04

RUN apt update &&\
    apt-get install -y apache2 &&\
    apt-get install -y apache2-utils &&\
    apt-get install subversion libapache2-mod-svn -y &&\
    apt-get install -y libapache2-mod-perl2 &&\

    #apk add --no-cache apache2 apache2-utils apache2-webdav mod_dav_svn && \
    #apk add --no-cache subversion && \
    #apk add --no-cache apache2-mod-perl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ &&\

    mkdir -p /run/apache2/ &&\
    mkdir /home/svn/ &&\
    #mkdir /etc/subversion &&\
    mkdir -p /var/svn/repos/xcloud_users &&\
    mkdir -p /home/httpd/perl/ &&\

    touch /etc/subversion/passwd &&\

    htpasswd -b /etc/subversion/passwd user user

ADD dav_svn.conf /etc/apache2/conf.d/dav_svn.conf
ADD new_repo.pl  /home/httpd/perl/new_repo.pl
ADD create_repo.sh /home/httpd/perl/create_repo.sh


EXPOSE 80 443 3690

CMD ["apache2ctl", "-D", "FOREGROUND"]
 #["/usr/sbin/httpd", "-D", "FOREGROUND"]



    




