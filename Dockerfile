FROM node:carbon-slim

# Create app directory
WORKDIR /forum_api

# Install app dependencies
COPY package.json /forum_api/
RUN npm install

# Bundle app source
COPY . /forum_api/
RUN npm run prepublish

CMD [ "npm", "run", "runServer" ]
