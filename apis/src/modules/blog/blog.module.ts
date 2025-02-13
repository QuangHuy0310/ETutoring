import { Mongoose } from 'mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '@entities/blog.entities';

@Module({
    imports: [MongooseModule.forFeature([
        {
            name: Blog.name,
            schema: BlogSchema,
        },
    ])],
    controllers: [
        BlogController,],
    providers: [
        BlogService,],
    exports: [BlogService]
})
export class BlogModule { }
