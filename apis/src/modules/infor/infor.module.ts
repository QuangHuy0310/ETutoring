import { InforController } from './infor.controller';
import { InforService } from './infor.service';
import { MoreInformation, MoreInformationSchema } from '@entities/infor.entities';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@modules/user/user.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        MongooseModule.forFeature([
            { name: MoreInformation.name, schema: MoreInformationSchema },
        ]
        )],
    controllers: [
        InforController, ],
    providers: [
        InforService,],
})
export class InforModule { }
