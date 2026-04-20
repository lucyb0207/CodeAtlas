FROM node:18

# install python
RUN apt-get update && apt-get install -y python3 python3-pip

# set working dir
WORKDIR /app

# copy files
COPY package*.json ./
RUN npm install

COPY . .

# expose port
EXPOSE 8080

# start server
CMD ["node", "server.js"]