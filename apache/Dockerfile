FROM alpine:3.14

RUN apk add --no-cache apache2 apache2-utils apache2-webdav mod_dav_svn && \
    apk add --no-cache subversion && \

    mkdir -p /run/apache2/ &&\
    mkdir /home/svn/ &&\
    mkdir /etc/subversion &&\

    touch /etc/subversion/passwd &&\

    htpasswd -b /etc/subversion/passwd user user

ADD dav_svn.conf /etc/apache2/conf.d/dav_svn.conf

EXPOSE 80 443

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]



    




