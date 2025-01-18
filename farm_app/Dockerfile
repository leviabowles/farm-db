FROM ubuntu:22.04
RUN apt update
RUN apt-get install python3 python3-pip -y
RUN apt-get install vim -y
RUN apt-get install mysql-client -y
RUN apt-get install libmysqlclient-dev -y
RUN apt-get install pkg-config -y
RUN pip3 install Django
RUN pip3 install mysqlclient
RUN pip3 install django_tables2
RUN pip3 install djangorestframework
RUN pip3 install django-dark
RUN pip3 install tzdata
RUN cd /var/
RUN mkdir www
RUN cd www
### BELOW THIS LINE ARE ONE-OFF

#RUN django-admin startproject django_app
#RUN cd django_app
#RUN python3 manage.py migrate
ENTRYPOINT bash -c 'cd /var/www/farm_app/farm ; python3 manage.py runserver 0.0.0.0:8000'
