FROM node:10.15
MAINTAINER Rogier Slag

EXPOSE 3000

RUN groupadd -r luser && useradd -r -g luser luser
RUN mkdir -p /home/luser/.pm2/
RUN chown -R luser.luser /home/luser
RUN yarn global add pm2

RUN mkdir /service
ADD .babelrc /service/
ADD yarn.lock /service/
ADD package.json /service/
RUN cd /service && yarn install --pure-lockfile
ADD src /service/src/
RUN cd /service && yarn dist

USER luser
WORKDIR /service/dist
CMD ["/usr/local/bin/pm2-docker", "start", "index.js", "--instances=max"]

