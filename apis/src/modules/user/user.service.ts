/* eslint-disable prettier/prettier */
import { RegisterDto } from '@dtos/auth.dto';
import { CreateNewUserDto } from '@dtos/user.dto';
import { User } from '@entities/user.entities';
import { MailService } from '@modules/mail/mail.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_ROLE } from '@utils/data-types/enums';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { SpecialUserService } from '@modules/specialUser/specialUser.service';
import * as XLSX from 'xlsx'; // Import xlsx for Excel file processing

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private mailService: MailService,
        private specialUserService: SpecialUserService,
    ) {}

    // Generate a random password if not provided
    private generateRandomPassword(length: number = 8): string {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    // Bulk create users from an Excel file
    async bulkCreateUsersFromFile(file: Express.Multer.File): Promise<User[]> {
        // Check mimetype for Excel files
        const allowedMimeTypes = [
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only Excel files (.xls, .xlsx) are allowed');
        }

        // Read the Excel file
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const usersData: RegisterDto[] = XLSX.utils.sheet_to_json(sheet); // Convert sheet to array of objects

        // Validate data
        if (!usersData || usersData.length === 0) {
            throw new BadRequestException('Excel file is empty');
        }

        if (usersData.length > 10) {
            throw new BadRequestException('Cannot create more than 10 users at once');
        }

        // Validate required fields (email)
        for (const user of usersData) {
            if (!user.email || typeof user.email !== 'string') {
                throw new BadRequestException('Each user must have a valid email');
            }
        }

        // Check for duplicate emails
        const emails = usersData.map(user => user.email);
        const existingUsers = await this.userModel.find({ email: { $in: emails } });
        if (existingUsers.length > 0) {
            const duplicateEmails = existingUsers.map(user => user.email);
            throw new BadRequestException(`Email already exists: ${duplicateEmails.join(', ')}`);
        }

        // Process users
        const usersToCreate = await Promise.all(
            usersData.map(async (user) => {
                const password = user.password || this.generateRandomPassword();
                const hashedPassword = await bcrypt.hash(password, 10);

                const role = await this.specialUserService.getRolebyEmail(user.email) || USER_ROLE.USER;

                return {
                    email: user.email,
                    hash: hashedPassword,
                    role: role as USER_ROLE,
                    generatedPassword: password,
                };
            })
        );

        // Insert users into database
        const createdUsers = await this.userModel.insertMany(
            usersToCreate.map(user => ({
                email: user.email,
                hash: user.hash,
                role: user.role,
            }))
        );

        // Send welcome emails
        await Promise.all(
            usersToCreate.map((user, index) => {
                this.sendWelcomeEmail(
                    user.email,
                    user.generatedPassword,
                    createdUsers[index]._id.toString()
                );
            })
        );

        // Delete the uploaded file
        fs.unlinkSync(file.path);

        return createdUsers as User[];
    }

    // Send a welcome email to a newly created user
    async sendWelcomeEmail(email: string, password: string, userId: string) {
        const subject = 'Welcome! Your account has been created';
        const text = `Your account has been successfully created!\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`;
        const html = `
            <h2>Welcome!</h2>
            <p>Your account has been successfully created!</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please log in and change your password as soon as possible.</p>
        `;

        await this.mailService.sendMail(email, subject, text, html);
    }

    // Save a new user to the database
    async saveNewUser(input: CreateNewUserDto): Promise<User> {
        return new this.userModel(input).save();
    }

    // Find a user by ID
    async findById(id: any) {
        return this.userModel.findById(id, { hash: 0 });
    }

    // Find a user by email
    async findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    // Find a user by email (test method)
    async findByEmailTest(email: string) {
        const isCheck = await this.userModel.findOne({ email });
        return isCheck.id;
    }

    // Get all users
    async getAllUsers(): Promise<User[]> {
        return this.userModel.find({}, { hash: 0 }).lean();
    }

    // Delete a user by ID
    async deleteUser(id: string): Promise<void> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        await this.userModel.deleteOne({ _id: id });
    }

    // Update a user by ID
    async updateUser(id: string, email: string, role: USER_ROLE): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check if the new email already exists (for another user)
        if (email && email !== user.email) {
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                throw new BadRequestException('Email already exists');
            }
        }

        // Update fields if provided
        if (email) user.email = email;
        if (role) user.role = role;

        return user.save();
    }

    async getRoleById(id: string): Promise<USER_ROLE> {
        const user = await this.userModel.findById(id, { role: 1 });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user.role;
    }
}