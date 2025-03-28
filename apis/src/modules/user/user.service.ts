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
import { SpecialUserService } from '@modules/specialUser/specialUser.service'; // Thêm import

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private specialUserService: SpecialUserService, // Tiêm SpecialUserService
  ) {}

  // Hàm sinh mật khẩu ngẫu nhiên
  private generateRandomPassword(length: number = 8): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // Method to add multiple users from a file
  async bulkCreateUsersFromFile(file: Express.Multer.File): Promise<User[]> {
    // Check file type
    if (file.mimetype !== 'application/json') {
      throw new BadRequestException('Only JSON files are allowed');
    }

    // Read file content
    const fileContent = fs.readFileSync(file.path, 'utf8');
    let usersData: RegisterDto[];
    try {
      usersData = JSON.parse(fileContent);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in file');
    }

    // Check limit of 10 users
    if (usersData.length > 10) {
      throw new BadRequestException('Cannot create more than 10 users at once');
    }

    // Check for duplicate emails
    const emails = usersData.map(user => user.email);
    const existingUsers = await this.userModel.find({ email: { $in: emails } });
    if (existingUsers.length > 0) {
      const duplicateEmails = existingUsers.map(user => user.email);
      throw new BadRequestException(`Email already exists: ${duplicateEmails.join(', ')}`);
    }

    // Hash passwords and prepare user data
    const usersToCreate = await Promise.all(
      usersData.map(async (user) => {
        // Sinh mật khẩu ngẫu nhiên nếu không có trong file JSON
        const password = user.password || this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lấy role từ SpecialUser, nếu không có thì mặc định là USER
        const role = await this.specialUserService.getRolebyEmail(user.email) || USER_ROLE.USER;

        return {
          email: user.email,
          hash: hashedPassword,
          role: role as USER_ROLE,
          generatedPassword: password, // Lưu tạm mật khẩu gốc để gửi email
        };
      })
    );

    // Insert into MongoDB
    const createdUsers = await this.userModel.insertMany(
      usersToCreate.map(user => ({
        email: user.email,
        hash: user.hash,
        role: user.role,
      }))
    );

    // Send welcome email to each user
    await Promise.all(
      usersToCreate.map((user, index) => {
        this.sendWelcomeEmail(
          user.email,
          user.generatedPassword, // Sử dụng mật khẩu đã sinh
          createdUsers[index]._id.toString()
        );
      })
    );

    // Delete temporary file after processing
    fs.unlinkSync(file.path);

    return createdUsers as User[];
  }

  // Method to send welcome email
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
}