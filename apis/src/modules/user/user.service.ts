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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService
  ) {}

   // Method to add multiple users at once
   async bulkCreateUsers(users: RegisterDto[]): Promise<User[]> {
    // Limit to a maximum of 10 users
    if (users.length > 10) {
      throw new BadRequestException('Cannot create more than 10 users at once');
    }

    // Check for duplicate emails
    const emails = users.map(user => user.email);
    const existingUsers = await this.userModel.find({ email: { $in: emails } });
    if (existingUsers.length > 0) {
      const duplicateEmails = existingUsers.map(user => user.email);
      throw new BadRequestException(`Email already exists: ${duplicateEmails.join(', ')}`);
    }

    // Hash passwords and prepare user data
    const usersToCreate = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10); // Hash password
        return {
          email: user.email,
          hash: hashedPassword,
          role: (user.role || 'USER') as USER_ROLE, // Cast role to USER_ROLE
        };
      })
    );

    // Add all users to MongoDB using insertMany
    const createdUsers = await this.userModel.insertMany(usersToCreate);

    // Send welcome email to each user
    await Promise.all(
      users.map((user, index) => {
        this.sendWelcomeEmail(
          user.email,
          user.password,
          createdUsers[index]._id.toString()
        );
      })
    );

    // Cast return data to User[]
    return createdUsers as User[];
  }

  // Method to send welcome email
  private async sendWelcomeEmail(email: string, password: string, userId: string) {
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

}
