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

# launch app using uvicorn
# Number of recommended workers is 2 x number_of_cores +1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--workers", "17"]
