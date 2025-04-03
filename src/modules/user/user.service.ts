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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private specialUserService: SpecialUserService,
  ) {}

  private generateRandomPassword(length: number = 8): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async bulkCreateUsersFromFile(file: Express.Multer.File): Promise<User[]> {
    if (file.mimetype !== 'application/json') {
      throw new BadRequestException('Only JSON files are allowed');
    }

    const fileContent = fs.readFileSync(file.path, 'utf8');
    let usersData: RegisterDto[];
    try {
      usersData = JSON.parse(fileContent);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in file');
    }

    if (usersData.length > 10) {
      throw new BadRequestException('Cannot create more than 10 users at once');
    }

    const emails = usersData.map(user => user.email);
    const existingUsers = await this.userModel.find({ email: { $in: emails } });
    if (existingUsers.length > 0) {
      const duplicateEmails = existingUsers.map(user => user.email);
      throw new BadRequestException(`Email already exists: ${duplicateEmails.join(', ')}`);
    }

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

    const createdUsers = await this.userModel.insertMany(
      usersToCreate.map(user => ({
        email: user.email,
        hash: user.hash,
        role: user.role,
      }))
    );

    await Promise.all(
      usersToCreate.map((user, index) => {
        this.sendWelcomeEmail(
          user.email,
          user.generatedPassword,
          createdUsers[index]._id.toString()
        );
      })
    );

    fs.unlinkSync(file.path);

    return createdUsers as User[];
  }

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

  async saveNewUser(input: CreateNewUserDto): Promise<User> {
    return new this.userModel(input).save();
  }

  async findById(id: any) {
    return this.userModel.findById(id, { hash: 0 });
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findByEmailTest(email: string) {
    const isCheck = await this.userModel.findOne({ email });
    return isCheck.id;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find({}, { hash: 0 }).lean();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userModel.deleteOne({ _id: id });
  }

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
}