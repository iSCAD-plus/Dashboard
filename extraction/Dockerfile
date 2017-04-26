# use the latest Python image
FROM python:3.6-slim

# Create directory to work out of
RUN mkdir /app
WORKDIR /app

# Install pipenv
ADD Pipfile* ./
RUN pip install pipenv && pipenv install

ADD . /app

CMD [ "pipenv", "run", "python", "main.py" ]

