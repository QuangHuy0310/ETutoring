import { Documentation, DocumentationDocument } from '@entities/document.entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentDto, FilterGetDocumentDto, InputCreateDto, UpdateCommentDto } from './dto/docu.dto';
import { USER_ERRORS } from '@utils/data-types/constants';
import { SocketGateway } from '@modules/chat/socket.gateway';

@Injectable()
export class DocuService {
    constructor(
        @InjectModel(Documentation.name) private docuModel: Model<DocumentationDocument>,
        private readonly gatewayService: SocketGateway
    ) { }

    async handleCreateDoc(user, dto: InputCreateDto) {
        user = user.sub;

        const payload = {
            userId: user,
            ...dto
        }

        return this.createDocu(payload);
    }
    async createDocu(docu: DocumentDto): Promise<DocumentDto> {
        const newDocu = new this.docuModel(docu);
        return await newDocu.save();
    }

    async getDocu(dto: FilterGetDocumentDto): Promise<DocumentDto[]> {
        const query: any = {
            roomId: dto.roomId,
            deletedAt: null,
        }

        if (dto.userId) {
            query.userId = dto.userId;
        }
        if (dto.createdAt) {
            query.createdAt = dto.createdAt;
        }

        if (dto.name) {
            query.name = { $regex: dto.name, $options: 'i' };
        }

        return this.docuModel.find(query).sort({ createdAt: 1 }).lean();
    }

    async handleUpdateComment(user, dto: UpdateCommentDto) {
        const userId = user.sub

        const docs = await this.docuModel.findById(dto.id).lean()

        if (userId == docs.userId) {
            throw new HttpException(USER_ERRORS.COMMENT_WRONG, HttpStatus.NOT_FOUND);
        }
        
        await this.gatewayService.sendCommentForDocument(docs.userId, {
            ...dto,
            roomId: docs.roomId,
        });
        return this.updateComment(dto);
    }
    async updateComment(dto: UpdateCommentDto): Promise<UpdateCommentDto> {
        return await this.docuModel.findByIdAndUpdate(dto.id, { comment: dto.comment })
    }
}
