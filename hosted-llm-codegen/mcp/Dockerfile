FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server.py .

# Run as non-root user
RUN useradd -m -u 1000 mcp
USER mcp

# MCP servers use stdio
ENTRYPOINT ["python", "server.py"]
