# Elasticsearch Integration for Borzolini Clinic API

This document provides comprehensive information about the Elasticsearch integration implemented in the Borzolini Clinic API.

## Overview

Elasticsearch has been integrated to provide powerful search capabilities, analytics, and data indexing for the clinic management system. The integration follows NestJS best practices and provides a robust foundation for search functionality.

## Architecture

### Core Components

1. **ElasticsearchService** - Main service for Elasticsearch operations
2. **ElasticsearchIndexService** - Manages index creation and mappings
3. **ElasticsearchSearchService** - Handles search operations and queries
4. **ElasticsearchSyncService** - Manages data synchronization between database and Elasticsearch
5. **Controllers** - REST API endpoints for various operations

### Module Structure

```
src/common/
├── elasticsearch.module.ts          # Main Elasticsearch module
├── elasticsearch.service.ts         # Core Elasticsearch operations
├── services/
│   ├── elasticsearch-index.service.ts    # Index management
│   ├── elasticsearch-search.service.ts   # Search operations
│   └── elasticsearch-sync.service.ts     # Data synchronization
└── controllers/
    ├── elasticsearch-health.controller.ts     # Health monitoring
    ├── elasticsearch-search.controller.ts     # Search endpoints
    └── elasticsearch-management.controller.ts # Management operations
```

## Configuration

### Environment Variables

```bash
# Elasticsearch Configuration
ELASTICSEARCH_ENABLED=true
ELASTICSEARCH_NODES=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
ELASTICSEARCH_API_KEY=
ELASTICSEARCH_TLS=false
ELASTICSEARCH_CA=
ELASTICSEARCH_REJECT_UNAUTHORIZED=true
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_REQUEST_TIMEOUT=30000
ELASTICSEARCH_PING_TIMEOUT=3000
ELASTICSEARCH_SNIFF_ON_START=false
ELASTICSEARCH_SNIFF_INTERVAL=60000
ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT=false
```

### Docker Setup

The project includes Docker Compose configuration for Elasticsearch and Kibana:

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  ports:
    - '9200:9200'
    - '9300:9300'
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    - cluster.name=clinic-cluster
    - node.name=clinic-node

kibana:
  image: docker.elastic.co/kibana/kibana:8.11.0
  ports:
    - '5601:5601'
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Indices

### Clinic Data Indices

1. **pets** - Pet information and health records
2. **appointments** - Appointment scheduling and management
3. **users** - User accounts and profiles
4. **clinics** - Clinic information and services
5. **health-records** - Medical records and health data

### Index Mappings

Each index is configured with optimized mappings for search performance:

- **Text fields** with multiple analyzers (standard, english)
- **Keyword fields** for exact matching and aggregations
- **Date fields** for temporal queries
- **Geo fields** for location-based searches
- **Numeric fields** for range queries

## API Endpoints

### Health Monitoring

- `GET /elasticsearch/health` - Service health status
- `GET /elasticsearch/health/cluster` - Cluster health information
- `GET /elasticsearch/health/indices` - Indices information

### Search Operations

- `GET /elasticsearch/search/pets` - Search pets
- `GET /elasticsearch/search/appointments` - Search appointments
- `GET /elasticsearch/search/users` - Search users
- `GET /elasticsearch/search/clinics` - Search clinics
- `GET /elasticsearch/search/health-records` - Search health records
- `POST /elasticsearch/search/global` - Global search across all indices
- `GET /elasticsearch/search/suggestions` - Get search suggestions

### Management Operations

- `POST /elasticsearch/management/indices/create` - Create all indices
- `GET /elasticsearch/management/indices/list` - List all indices
- `DELETE /elasticsearch/management/indices/:indexName` - Delete specific index
- `DELETE /elasticsearch/management/indices/all` - Delete all indices
- `POST /elasticsearch/management/sync/all` - Sync all data
- `POST /elasticsearch/management/sync/:indexName` - Sync specific index
- `GET /elasticsearch/management/sync/status/:indexName` - Get sync status

## Search Features

### Advanced Search Capabilities

1. **Full-text search** with relevance scoring
2. **Fuzzy matching** for typo tolerance
3. **Filtering** by various criteria (clinic, user, status, etc.)
4. **Aggregations** for analytics and reporting
5. **Highlighting** for search result emphasis
6. **Sorting** by multiple fields
7. **Pagination** for large result sets

### Search Query Examples

```typescript
// Search pets with filters
const results = await elasticsearchSearchService.searchPets(
  'golden retriever',
  { clinicId: 'clinic123', status: ['active'] },
  { size: 20, highlight: true, aggregations: true }
);

// Global search across all indices
const globalResults = await elasticsearchSearchService.globalSearch(
  'vaccination',
  { clinicId: 'clinic123' },
  { size: 10 }
);
```

## Data Synchronization

### Sync Strategies

1. **Full Sync** - Complete data synchronization
2. **Incremental Sync** - Sync only changed data
3. **Real-time Sync** - Immediate synchronization on data changes
4. **Batch Sync** - Process multiple documents efficiently

### Sync Operations

- **Create** - Index new documents
- **Update** - Update existing documents
- **Delete** - Remove documents from index
- **Bulk Operations** - Process multiple documents at once

## Performance Optimization

### Index Settings

- **Sharding** - Single shard for development, multiple for production
- **Replicas** - Configurable replica count
- **Refresh Interval** - Optimized for search vs. indexing balance
- **Analysis** - Custom analyzers for domain-specific text processing

### Search Optimization

- **Query Optimization** - Efficient query construction
- **Field Selection** - Return only necessary fields
- **Caching** - Leverage Elasticsearch caching mechanisms
- **Connection Pooling** - Efficient client connection management

## Monitoring and Health Checks

### Health Monitoring

- **Service Status** - Check if Elasticsearch is enabled and connected
- **Cluster Health** - Monitor cluster status and performance
- **Index Health** - Verify index integrity and performance
- **Connection Status** - Monitor client connectivity

### Logging

Comprehensive logging for all operations:
- **Debug logs** for development
- **Info logs** for normal operations
- **Warning logs** for potential issues
- **Error logs** for failures and exceptions

## Security Considerations

### Authentication

- **Username/Password** authentication
- **API Key** authentication
- **TLS/SSL** encryption support
- **Certificate validation** options

### Access Control

- **Index-level** access control
- **Field-level** security (planned)
- **Audit logging** for all operations

## Development and Testing

### Local Development

1. **Start Elasticsearch** using Docker Compose
2. **Configure environment** variables
3. **Create indices** using management endpoints
4. **Sync test data** for development

### Testing

- **Unit tests** for all services
- **Integration tests** for API endpoints
- **Performance tests** for search operations
- **Load testing** for bulk operations

## Deployment

### Production Considerations

1. **Cluster Configuration** - Multi-node setup for high availability
2. **Security** - Enable X-Pack security features
3. **Monitoring** - Set up monitoring and alerting
4. **Backup** - Configure index snapshots and backups
5. **Scaling** - Plan for horizontal scaling

### Environment-Specific Configurations

- **Development** - Single node, minimal security
- **Staging** - Multi-node, basic security
- **Production** - Full cluster, comprehensive security

## Troubleshooting

### Common Issues

1. **Connection Failures** - Check network and authentication
2. **Index Creation Errors** - Verify permissions and mappings
3. **Search Performance** - Optimize queries and index settings
4. **Sync Failures** - Check data format and validation

### Debug Tools

- **Kibana** - Web interface for Elasticsearch management
- **Elasticsearch Head** - Chrome extension for debugging
- **Logs** - Application and Elasticsearch logs
- **Health Endpoints** - Built-in health monitoring

## Future Enhancements

### Planned Features

1. **Real-time Search** - Live search updates
2. **Advanced Analytics** - Complex aggregations and visualizations
3. **Machine Learning** - Anomaly detection and recommendations
4. **Graph Search** - Relationship-based search capabilities
5. **Multi-language Support** - Internationalization for search

### Integration Opportunities

1. **AI Health Monitoring** - Enhanced health insights
2. **Analytics Dashboard** - Real-time clinic metrics
3. **Reporting Engine** - Advanced reporting capabilities
4. **Mobile Search** - Optimized mobile search experience

## Conclusion

The Elasticsearch integration provides a solid foundation for advanced search capabilities in the Borzolini Clinic API. The modular architecture ensures maintainability and extensibility, while the comprehensive feature set addresses current and future search requirements.

For questions or support, refer to the Elasticsearch documentation or contact the development team.
