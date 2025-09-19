import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as NestElasticsearchModule, ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

import { ElasticsearchService } from './elasticsearch.service';
import { Module } from '@nestjs/common';
import { getElasticsearchConfig } from '../config/elasticsearch.config';

@Module({
  imports: [
    // Only register Elasticsearch if enabled
    ...(process.env.ELASTICSEARCH_ENABLED === 'true'
      ? [
          NestElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: getElasticsearchConfig,
            inject: [ConfigService],
          }),
        ]
      : []),
  ],
  providers: [
    // Conditional provider based on Elasticsearch availability
    ...(process.env.ELASTICSEARCH_ENABLED === 'true'
      ? [
          {
            provide: ElasticsearchService,
            useFactory: (nestElasticsearchService: NestElasticsearchService, configService: ConfigService) => {
              return new ElasticsearchService(nestElasticsearchService, configService);
            },
            inject: [NestElasticsearchService, ConfigService],
          },
        ]
      : [
          {
            provide: ElasticsearchService,
            useFactory: (configService: ConfigService) => {
              return new ElasticsearchService(null, configService);
            },
            inject: [ConfigService],
          },
        ]),
  ],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
