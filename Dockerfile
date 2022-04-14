FROM node:14-slim

ENV API_PORT="80"
ENV DEBUG="api:*"

RUN mkdir -p /MAD9124-W22-P1-GIFTR /MAD9124-W22-P1-GIFTR/config /MAD9124-W22-P1-GIFTR/exceptions /MAD9124-W22-P1-GIFTR/logs /MAD9124-W22-P1-GIFTR/middleware /MAD9124-W22-P1-GIFTR/models /MAD9124-W22-P1-GIFTR/public /MAD9124-W22-P1-GIFTR/routes /MAD9124-W22-P1-GIFTR/startup

COPY config/ /MAD9124-W22-P1-GIFTR/config/
COPY exceptions/ /MAD9124-W22-P1-GIFTR/exceptions/
COPY middleware/ /MAD9124-W22-P1-GIFTR/middleware/
COPY models/ /MAD9124-W22-P1-GIFTR/models/
# COPY public/ /MAD9124-W22-P1-GIFTR/public/
COPY routes/ /MAD9124-W22-P1-GIFTR/routes/
COPY startup/ /MAD9124-W22-P1-GIFTR/startup/
COPY server.js app.js package.json /MAD9124-W22-P1-GIFTR/

WORKDIR /MAD9124-W22-P1-GIFTR
RUN npm install --unsafe-perm

EXPOSE 80
CMD node app.js