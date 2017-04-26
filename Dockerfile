# Use the latest Node image
FROM node:latest

# Create directory to work out of
RUN mkdir /app
WORKDIR /app

# Install dependencies first (assuming they'll change less frequently, this
# will make image re-builds faster)
ADD package.json package.json
RUN npm install

# Build source code
ADD . /app
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
