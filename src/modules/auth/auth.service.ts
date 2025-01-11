import { LoginDto, RegisterDto } from '@dtos/auth.dto';
import { CreateNewUserDto } from '@dtos/user.dto';
import { User } from '@entities';
import { UserService } from '@modules/index-service';
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

  async register(input: RegisterDto) {
    try {
      const hash = await this.hashPassword(input.password);
      const data: CreateNewUserDto = {
        ...input,
        hash,
      };
      return this.userService.saveNewUser(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(input: LoginDto) {
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
    if (!(await this.comparePasswords(input.password, user.hash))) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
    console.log(user)
  
    const payload = { email: user.email, sub: user.id, role: user.role, address:user.address, phone: user.phone, name:user.name};
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
