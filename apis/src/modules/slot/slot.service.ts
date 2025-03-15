// import { DocumentFile, DocumentFileDocument } from '@entities/slot.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slot, SlotDocument } from '@entities/slot.entities';
import { CreateSlotDto } from './dto/slot.dto';

@Injectable()
export class SlotService {
    constructor(
        @InjectModel(Slot.name)
        private readonly slotModel: Model<SlotDocument>,
    ) { }

    async createSlot(slot: CreateSlotDto): Promise<CreateSlotDto> {
        const newSlot = new this.slotModel(slot);
        newSlot.save();

        return slot;
    }

    async getSlot(): Promise<Slot[]> {
        return this.slotModel.find();
    }

    async getSlotById(id: string): Promise<Slot> {
        return await this.slotModel.findById(id);
    }

}
