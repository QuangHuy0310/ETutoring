import { Mongoose } from 'mongoose';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { Module } from '@nestjs/common';
// import { DocumentFile, DocumentFileSchema } from '@entities/slot.entities';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from '@entities/slot.entities';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: Slot.name,
                    schema: SlotSchema,
                },
            ]
        )
    ],
    controllers: [
        SlotController,],
    providers: [
        SlotService,],
    exports: [SlotService]
})
export class SlotModule { }
