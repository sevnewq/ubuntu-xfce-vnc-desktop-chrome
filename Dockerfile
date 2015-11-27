FROM ubuntu:14.04.3
MAINTAINER Chieh Yu <welkineins@gmail.com>

ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y
RUN apt-get install -y supervisor openssh-server vim-tiny \
		xfce4 xfce4-goodies x11vnc xvfb firefox \
		gconf-service libnspr4 libnss3 fonts-liberation \
		libappindicator1 libcurl3
RUN apt-get autoclean && apt-get autoremove && \
		rm -rf /var/lib/apt/lists/*

# download google chrome and install
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome*.deb
RUN apt-get install -f

WORKDIR /root

ADD startup.sh ./
ADD supervisord.conf ./

# prepare chrome extension to install
#ADD kcoilljlnfjahoofolooodhmgojcfnpo.json /opt/google/chrome/extensions/

# develop version chrome extension
COPY ext ./ext

COPY xfce4 ./.config/xfce4

EXPOSE 5900
#EXPOSE 22

ENTRYPOINT ["./startup.sh"]
