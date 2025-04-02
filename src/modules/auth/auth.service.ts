/* eslint-disable prettier/prettier */
import { LoginDto, RegisterDto } from '@dtos/auth.dto';
import { CreateNewUserDto } from '@dtos/user.dto';
import { User } from '@entities';
import { UserService } from '@modules/index-service';
import { SpecialUserService } from '@modules/specialUser/specialUser.service';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hashSync } from 'bcrypt';


@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set()
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly specialUserService: SpecialUserService,
  ) { }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ user });
  }

  async hashPassword(password: string): Promise<string> {
    return hashSync(password, parseInt(process.env.ROUND_HASH));
  }

  async comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Promise<any> {
    return compare(password, storedPasswordHash);
  }


  async logout(refreshToken: string): Promise<string> {
    // Thu hồi token bằng cách thêm vào danh sách thu hồi
    this.revokedTokens.add(refreshToken);
    return 'Logged out successfully';
  }

  isTokenRevoked(token: string): boolean {
    // Kiểm tra token có bị thu hồi không
    return this.revokedTokens.has(token);
  }

  // Ví dụ kiểm tra token trong quá trình xác thực
  async verifyJwt(jwt: string): Promise<any> {
    if (this.isTokenRevoked(jwt)) {
      throw new Error('Token has been revoked');
    }
    return this.jwtService.verifyAsync(jwt);
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return await this.specialUserService.checkEmailExist(email);
  }

  async getRolebyEmail(email: string): Promise<string | null> {
    return await this.specialUserService.getRolebyEmail(email);
  }

  async register(input: RegisterDto) {
    try {
      if (await this.checkEmailExist(input.email)) {

        const [hash, role] = await Promise.all([
          this.hashPassword(input.password),
          this.specialUserService.getRolebyEmail(input.email)
        ])


        if (role) {
           const data: CreateNewUserDto = {
              ...input,
              hash,
              role,
           };
           return this.userService.saveNewUser(data);
        }
      } else {
        const hash = await this.hashPassword(input.password);
        const data: CreateNewUserDto = {
          ...input,
          hash,
          role: input.role || 'user',
        };
        return this.userService.saveNewUser(data);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(input: LoginDto) {
    // Check Email
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new HttpException('Email does not exist', HttpStatus.UNAUTHORIZED);
    }
  
    // Check Password
    const isPasswordValid = await this.comparePasswords(input.password, user.hash);
    if (!isPasswordValid) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }
  
    // Login successful, generate JWT tokens
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '50m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
  
    return {
      accessToken,
      refreshToken,
    };
  }
  
  

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const newAccessToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
      }, { expiresIn: '15m' });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new HttpException('Invalid Refresh Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
