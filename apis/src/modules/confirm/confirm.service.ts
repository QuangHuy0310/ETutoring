import { Confirm } from '@entities/confirm-nofitication.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConfirm } from './confirm.interface';
import { CreateConfirmDto } from './dto/confirmDto';

@Injectable()
export class ConfirmService implements IConfirm {
    constructor(
        @InjectModel(Confirm.name)
        private confirmModel: Model<Confirm>,
    ){}
    createConfirm(createConfirmDto: CreateConfirmDto): Promise<string> {
        throw new Error('Method not implemented.');
    }

 }
