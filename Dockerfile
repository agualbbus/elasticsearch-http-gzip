FROM  node:7.0.0

RUN mkdir /app
WORKDIR /app

COPY start-server.sh /start-server.sh

VOLUME /app

COPY ./ /app
RUN chmod +x /start-server.sh

CMD ["/start-server.sh"]
