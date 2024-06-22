import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User, UserDocument, UserWithoutPassword } from './user.schema';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.userModel.findOne({
      $or: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const newUser = await createdUser.save();
    return this.omitPassword(newUser.toObject());
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => this.omitPassword(user.toObject()));
  }

  async findOneById(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.userModel.findById(id).exec();
    return this.omitPassword(user?.toObject());
  }

  async findOne(username: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user ? this.omitPassword(user.toObject()) : undefined;
  }

  async loginFind(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username: username })
    if(!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword | undefined> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingUser = await this.userModel.findOne({
      $or: [{ username: updateUserDto.username }, { email: updateUserDto.email }],
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already in use');
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    return this.omitPassword(updatedUser?.toObject());
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    return { message: 'User has been removed' };
  }

  private omitPassword(user: User | undefined): UserWithoutPassword | undefined {
    if (!user) {
      return undefined;
    }
    const { password, ...result } = user;
    return result as UserWithoutPassword;
  }
}
