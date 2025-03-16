import { BadRequestException, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { RequiredByUserRoles } from '@utils/decorator';
import { diskStorage } from 'multer';
import { Request } from 'express';


@ApiTags('UPLOAD')
@Controller()
export class UploadController {
    constructor(){}
    @RequiredByUserRoles()
    @Post('/upload')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './upload',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + file.originalname;
                    callback(null, uniqueSuffix);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf|docx)$/)) {
                    return callback(
                        new BadRequestException('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    async addNewImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        if (!file) {
            throw new BadRequestException('No file uploaded or file is invalid.');
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/upload/${file.filename}`;
        return fileUrl;
    }
}
