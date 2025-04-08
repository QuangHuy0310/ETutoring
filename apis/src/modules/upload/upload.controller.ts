import {
    BadRequestException,
    Controller,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { Request } from 'express';
  import { ApiTags } from '@nestjs/swagger';
  import { RequiredByUserRoles } from '@utils/decorator';
  
  @ApiTags('UPLOAD')
  @Controller()
  export class UploadController {
    constructor() {}
  
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
          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ];
  
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
              new BadRequestException('File type not allowed!'),
              false,
            );
          }
  
          callback(null, true);
        },
      }),
    )
    async addNewImage(
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request,
    ) {
      if (!file) {
        throw new BadRequestException('No file uploaded or file is invalid.');
      }
  
      const fileUrl = `${req.protocol}://${req.get('host')}/upload/${file.filename}`;
      return { fileUrl };
    }
  }
  