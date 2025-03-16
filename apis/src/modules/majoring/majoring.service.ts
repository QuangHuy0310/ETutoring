import { Major, MajorDocument } from '@entities/majoring.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMajoringDto, MajoringDto } from './dto/majoring.dto';

@Injectable()
export class MajoringService {
    constructor(
        @InjectModel(Major.name)
        private readonly majorModel: Model<MajorDocument>,
    ) { }

    async createMajor(major: MajoringDto): Promise<Major> {
        const newMajor = await new this.majorModel(major).save();
        return newMajor;
    }

    async getMajors(payload: string): Promise<any> {
        const id = payload;
        if (!id) {
            return this.majorModel.find().lean();
        }
        const major = await this.majorModel.findById(id).lean();
        return major ? [major] : [];

    }
}
