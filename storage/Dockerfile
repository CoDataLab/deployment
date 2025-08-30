# File: storage/Dockerfile

# 1. Use an official Python runtime as a parent image
FROM python:3.12-slim-bullseye

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the dependencies file and install them
# This is done first to leverage Docker's layer caching
COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 4. Copy the rest of the application's code into the container
COPY . .

# 5. The command to run when the container starts
#    --host 0.0.0.0 is crucial to make it accessible from other containers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]