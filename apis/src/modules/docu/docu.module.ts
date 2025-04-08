import { DocuController } from './docu.controller';
import { DocuService } from './docu.service';
import { Documentation, DocumentationSchema } from '@entities/document.entities';
import { ChatModule } from '@modules/chat/chat.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        forwardRef(() => ChatModule),
        MongooseModule.forFeature([
            { name: Documentation.name, schema: DocumentationSchema },
        ])
    ],
    controllers: [
        DocuController,
    ],
    providers: [
        DocuService,],
})
export class DocuModule { }
