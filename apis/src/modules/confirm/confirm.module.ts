import { MongooseModule } from '@nestjs/mongoose';
import { ConfirmController } from './confirm.controller';
import { ConfirmService } from './confirm.service';
import { Module } from '@nestjs/common';
import { Confirm, ConfirmSchema } from '@entities/confirm-nofitication.entities';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Confirm.name,
                schema: ConfirmSchema,
            },
        ])
    ],
    controllers: [
        ConfirmController,],
    providers: [
        ConfirmService,],
})
export class ConfirmModule { }
