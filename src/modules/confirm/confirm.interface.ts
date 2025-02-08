import { CreateConfirmDto } from "./dto/confirmDto";

export interface IConfirm{
    createConfirm(createConfirmDto: CreateConfirmDto): Promise<string>;   

}