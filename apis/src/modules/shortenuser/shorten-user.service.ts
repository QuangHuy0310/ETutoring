import { ShortenUser, ShortenUserDocument } from "@entities/shorten-user.entities";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ShortenUserService {
    constructor(
        @InjectModel(ShortenUser.name) private shortenUserModel: Model<ShortenUserDocument>
    ) {}

    async checkEmailExist(email: string) {
        return this.shortenUserModel.exists({ email });
}

    async saveShortenUser(email: string, role: string): Promise<ShortenUserDocument> {
        return new this.shortenUserModel({ email, role }).save();
    }

}


