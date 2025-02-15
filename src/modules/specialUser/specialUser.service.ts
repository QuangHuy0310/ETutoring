import { SpecialUser, SpecialUserDocument } from "@entities/special-role-user.entities";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class SpecialUserService {
    constructor(
        @InjectModel(SpecialUser.name) private specialUserModel: Model<SpecialUserDocument>
    ) {}

    async checkEmailExist(email: string): Promise<boolean> {
        return this.specialUserModel.exists({ email }).then((result) => !!result);
}
    async getRolebyEmail(email: string): Promise<string | null> {
        const user = await this.specialUserModel.findOne({ email }).exec();
        return user?.role || null;
    }

    async saveSpecialUser(email: string, role: string): Promise<SpecialUserDocument> {
        return new this.specialUserModel({ email, role }).save();
    }

    async findByEmailAndRole(email: string, role: string): Promise<SpecialUserDocument | null> {
        return this.specialUserModel.findOne({ email, role }).exec();
      }

}


