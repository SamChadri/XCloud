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
    mkdir /var/www/perl/ &&\

    touch /etc/subversion/passwd &&\

    htpasswd -b /etc/subversion/passwd user user



ADD dav_svn.conf /etc/apache2/conf.d/dav_svn.conf
ADD cgi-enabled.conf /etc/apache2/conf-available/cgi-enabled.conf
ADD new_repo.pl  /home/httpd/perl/new_repo.pl
ADD new_repo.pl  /var/www/perl/new_repo.pl
ADD create_repo.sh /home/httpd/perl/create_repo.sh
ADD create_repo.sh /var/www/perl/create_repo.sh

RUN chmod a+x /home/httpd/perl/create_repo.sh &&\
    chmod a+x /home/httpd/perl/new_repo.pl &&\
    chmod -R 0755 /home/   &&\

    chmod a+wr /var/svn/repos/xcloud_users/ &&\
    touch /home/httpd/perl/log.txt &&\
    chmod 0777 home/httpd/perl/log.txt

RUN  a2enmod cgid 
RUN  a2enconf cgi-enabled 

ENV SVN_PORT=1024

EXPOSE 80 443 3690 1024

CMD ["apache2ctl", "-D", "FOREGROUND"]
 #["/usr/sbin/httpd", "-D", "FOREGROUND"]



    




