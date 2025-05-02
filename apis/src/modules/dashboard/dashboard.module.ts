import { MatchingModule } from '@modules/matching/matching.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';


import { forwardRef, Module } from '@nestjs/common';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
    imports: [
        forwardRef(() => MatchingModule),
        forwardRef(() => ChatModule),

    ],
    controllers: [
        DashboardController,],
    providers: [
        DashboardService,],
})
export class DashboardModule { }
