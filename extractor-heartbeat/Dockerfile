FROM python:3.9

WORKDIR /code

# set python env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install pipenv
RUN pip install pipenv

# copy required pipenv files
COPY ./Pipfile ./Pipfile.lock /code/


# install requirements locally in the project at /code/.venv
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

# add requirements to path
ENV PATH="/code/.venv/bin:$PATH"

# copy app code at end to make it easier to change code and not have to rebuild requirement layers
COPY ./app /code/app

COPY heartbeat_listener_sync.py /code/heartbeat_listener_sync.py

# run extractor heartbeat

CMD ["python3", "-u", "/code/heartbeat_listener_sync.py"]