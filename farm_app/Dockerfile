FROM ubuntu
RUN apt update
RUN apt-get install python3 python3-pip -y
RUN apt-get install vim -y
RUN apt-get install mysql-client -y
RUN apt-get install libmysqlclient-dev -y
RUN pip3 install Django
RUN pip3 install mysqlclient
RUN pip3 install django_tables2
RUN pip3 install djangorestframework
RUN pip3 install django-dark
RUN pip3 install tzdata 
RUN cd /var/
RUN mkdir www
RUN cd www
