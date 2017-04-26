# Dashboard

# Prerequisites

You must have the following software installed:

* [Docker Community Edition](https://www.docker.com/community-edition)
* [NPM](https://www.npmjs.com/)
* [Yarn](https://yarnpkg.com/en/docs/install)
* [MongoDB](https://docs.mongodb.com/manual/installation/?jmp=footer)

# Using Docker

Currently, we do not have a central Docker repository for this project, so each
developer must build the images when they want to use them.

## Building Images

There are two images you need to build: `iscad-api` and `iscad-extractor`.

First, from the root of the project, just run `bash dockerize.sh`, and the
image should get built automatically.

Then, run `cd extraction` followed by `bash dockerize.sh` and the second image
should get built automatically.

*Note: you must rebuild these images any time you update the code (locally or
by pulling changes).* These have been designed to cache as much as possible, so
the builds should be relatively fast after the first time. Eventually, we
should have a central repository for images so they don't have to be rebuilt
locally.

## Deploying locally

To deploy the stack locally, run:

```
docker stack deploy -c docker-compose.yml iscad
```

To turn it off, run:

```
docker stack rm iscad
```

## Loading data locally

To load the data locally, first make sure you have this list of files:

```
extractordata/
├── caac_cross-cutting.xls
├── decisionsDatabaseUnlocked.xlsx
├── mandate_table_internal.xlsx
├── poc_cross-cutting.xls
└── wps_cross-cutting.xls
```

Ensure you have the services running locally (see above, "Deploying locally", for instructions).

Then run the loader:

```
docker run -v `pwd`/extractordata:/app/data --network host iscad-extractor 
```



