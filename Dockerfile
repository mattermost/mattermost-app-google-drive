FROM node:15.6.0

WORKDIR /mattermost-app-google-drive
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]
