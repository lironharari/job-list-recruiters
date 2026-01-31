# ElasticSearch Service on Render.com

This folder contains configuration and documentation for running an ElasticSearch private service on Render.com.

## Setup Instructions

1. **Create a new Private Service on Render.com**
   - Service Type: Private Service
   - Name: elasticsearch
   - Docker or Environment: Use the official ElasticSearch Docker image (recommended)
   - Port: 9200

2. **Environment Variables**
   - Set any required ElasticSearch environment variables (e.g., discovery.type=single-node for dev/test)

3. **Connecting from Backend**
   - Set `ELASTICSEARCH_URL` in your backend service to `http://elasticsearch:9200` (the internal Render DNS name).

4. **Security**
   - For production, configure authentication and restrict access to the private network.

## Example Docker Compose (for local dev)

```
version: '3.7'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
volumes:
  esdata:
```

---

Add any Render-specific notes or credentials here as needed.
