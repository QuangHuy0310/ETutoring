/*
https://docs.nestjs.com/providers#services
*/

import { ChatService } from '@modules/chat/chat.service';
import { MatchingService } from '@modules/matching/matching.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Filter } from 'mongodb';
import { FilterTimeDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
    constructor(
        private readonly matchingService: MatchingService,
        private readonly chatService: ChatService,
    ) { }

    async getNumberMessageInMonth(idUser: string, dto: FilterTimeDto) {
        const { month, year } = dto

        let startDate: Date | undefined;
        let endDate: Date | undefined;


        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
        }

        const roomIds = await this.matchingService.getUserById(idUser)

        const payload = {
            roomIds: roomIds.roomIds,
            senderId: idUser,
            relatedIds: roomIds.relatedUsers,
            startDate: startDate,
            endDate: endDate
        }
        return this.chatService.getNumbersOfMessage(payload)
    }

    async getNumbersMatching(idUser: string, dto: FilterTimeDto) {

        const startDate = new Date(dto.year, 0, 1);
        const endDate = new Date(dto.year + 1, 0, 1);

        const payload = {
            start: startDate,
            end: endDate,   
            createdBy: idUser
        }

        if( dto.month == 0){
            return await this.matchingService.getValueByYear(payload)
        }
        return await this.matchingService.getNumbersMatching(payload)
    }

}
