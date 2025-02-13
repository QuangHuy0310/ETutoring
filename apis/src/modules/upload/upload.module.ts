/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
    controllers: [UploadController],
    providers: [UploadController],
    exports: [UploadController]
})
export class UploadModule {}
