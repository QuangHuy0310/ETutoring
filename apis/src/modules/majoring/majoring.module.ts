import { MongooseModule } from '@nestjs/mongoose';
import { MajoringController } from './majoring.controller';
import { MajoringService } from './majoring.service';


import { Module } from '@nestjs/common';
import { Major, MajorSchema } from '@entities/majoring.entities';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Major.name, schema: MajorSchema }]),
    ],
    controllers: [
        MajoringController, ],
    providers: [
        MajoringService, ],
})
export class MajoringModule {}
