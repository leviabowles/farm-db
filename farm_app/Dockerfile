FROM ubuntu:22.04

# Install system dependencies required for Python and MySQL client libraries
RUN apt-get update && \
	apt-get install -y python3 python3-pip vim mysql-client libmysqlclient-dev pkg-config && \
	rm -rf /var/lib/apt/lists/*

# Set working directory inside the container where the Django project will live
WORKDIR /app

# Copy the Django application source code and requirements into the image
# The build context will be set to the repository root, so we copy from there.
COPY farm_app/farm/ ./
COPY requirements.txt .

# Install Python dependencies from requirements.txt (ensures versions match host)
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the default Django development server port
EXPOSE 8000

# Default command runs the Django development server
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
