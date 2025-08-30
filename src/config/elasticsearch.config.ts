import { ConfigService } from '@nestjs/config';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const getElasticsearchConfig = (config: ConfigService): ElasticsearchModuleOptions => {
  const isEnabled = config.get<boolean>('ELASTICSEARCH_ENABLED', false);

  if (!isEnabled) {
    return {
      node: 'http://localhost:9200', // Default fallback
    };
  }

  const nodes = config.get<string>('ELASTICSEARCH_NODES', 'http://localhost:9200');
  const username = config.get<string>('ELASTICSEARCH_USERNAME');
  const password = config.get<string>('ELASTICSEARCH_PASSWORD');
  const apiKey = config.get<string>('ELASTICSEARCH_API_KEY');
  const tls = config.get<boolean>('ELASTICSEARCH_TLS', false);
  const ca = config.get<string>('ELASTICSEARCH_CA');
  const rejectUnauthorized = config.get<boolean>('ELASTICSEARCH_REJECT_UNAUTHORIZED', true);

  const configOptions: ElasticsearchModuleOptions = {
    node: nodes,
    maxRetries: config.get<number>('ELASTICSEARCH_MAX_RETRIES', 3),
    requestTimeout: config.get<number>('ELASTICSEARCH_REQUEST_TIMEOUT', 30000),
    pingTimeout: config.get<number>('ELASTICSEARCH_PING_TIMEOUT', 3000),
    sniffOnStart: config.get<boolean>('ELASTICSEARCH_SNIFF_ON_START', false),
    sniffInterval: config.get<number>('ELASTICSEARCH_SNIFF_INTERVAL', 60000),
    sniffOnConnectionFault: config.get<boolean>('ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT', false),
  };

  // Authentication
  if (username && password) {
    configOptions.auth = {
      username,
      password,
    };
  } else if (apiKey) {
    configOptions.auth = {
      apiKey,
    };
  }

  // TLS Configuration
  if (tls) {
    configOptions.tls = {
      ca,
      rejectUnauthorized,
    };
  }

  return configOptions;
};
