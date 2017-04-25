# Use the latest Node image
FROM kkarczmarczyk/node-yarn

# Create directory to work out of
RUN mkdir /app
WORKDIR /app

# Install dependencies first (assuming they'll change less frequently, this
# will make image re-builds faster)
ADD package.json package.json
RUN yarn

# Build source code
ADD . /app
RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]
