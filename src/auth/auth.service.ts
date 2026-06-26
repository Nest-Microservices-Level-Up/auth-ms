import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: "User with email already exists",
        });
      }

      const newUser = await this.user.create({
        data: {
          name: name,
          password: bcrypt.hashSync( password, 10 ),
          email: email,
        }
      })

      const { password: __, ...rest } = newUser;

      return{
        user: rest,
        token: "abcdef"
      }


    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = bcrypt.compareSync( password, user.password );

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: "Invalid credentials",
        });
      }

      const { password: __, ...rest } = user;

      return{
        user: rest,
        token: "abcdef"
      }


    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

}
