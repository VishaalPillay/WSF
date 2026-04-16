# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose port 8000 for the FastAPI application
EXPOSE 8000

# Define environment variables with defaults for host.docker.internal
ENV SUPABASE_URL=http://host.docker.internal:54321
ENV SUPABASE_ANON_KEY=your-anon-key-here

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
