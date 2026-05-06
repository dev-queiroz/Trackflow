import { Module, Logger } from '@nestjs/common';
import {
  CacheModule,
  type CacheManagerOptions,
} from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): CacheManagerOptions => {
        const log = new Logger('AnalyticsCache');
        const ttl = config.get<number>('ANALYTICS_CACHE_TTL_MS') ?? 60_000;
        const redisUrl = config.get<string>('REDIS_URL');
        if (!redisUrl) {
          return { ttl };
        }
        try {
          return {
            ttl,
            stores: [
              new Keyv({
                store: new KeyvRedis(redisUrl),
                namespace: 'trackflow:analytics',
                ttl,
              }),
            ],
          };
        } catch (err) {
          log.warn(
            `Redis indisponível para cache de analytics; usando memória. ${(err as Error).message}`,
          );
          return { ttl };
        }
      },
    }),
    PrismaModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
