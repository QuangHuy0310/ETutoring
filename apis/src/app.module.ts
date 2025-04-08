import { DocuModule } from './modules/docu/docu.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AuthenticationGuard } from '@guards/authentication.guard';
import * as MODULES from '@modules';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configs } from '@utils/configs/config';
import { HttpErrorFilter } from '@utils/filters/http.filter';
import { routes } from '@utils/routes';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ...Object.values(MODULES),
    RouterModule.register(routes),
    MongooseModule.forRoot(configs.mongoDBUriBackEnd),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 500,
      },
    ]),
    JwtModule.register({
      secret: 'GreenwichGreenwich',
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
