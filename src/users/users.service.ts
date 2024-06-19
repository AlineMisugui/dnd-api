import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
    private readonly users: User[] = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
            email: 'john@example.com',
            name: 'John Doe'
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
            email: 'maria@example.com',
            name: 'Maria Doe'
        },
    ];

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = this.users.find(user => user.username === createUserDto.username || user.email === createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = {
            userId: this.users.length + 1,
            ...createUserDto,
            password: hashedPassword,
        };

        this.users.push(newUser);
        return this.omitPassword(newUser);
    }

    async findAll(): Promise<User[]> {
        return this.users.map(user => this.omitPassword(user));
    }

    async findOneById(userId: number): Promise<User | undefined> {
        const user = this.users.find(user => user.userId === userId);
        return this.omitPassword(user);
    }

    async findOne(username: string): Promise<User | undefined> {
        const user = this.users.find(user => user.username === username);
        return user ? this.omitPassword(user) : undefined;
    }

    async update(userId: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
        const userIndex = this.users.findIndex(user => user.userId === userId);
        if (userIndex === -1) {
            throw new BadRequestException('User not found');
        }

        const existingUser = this.users.find(user => (user.username === updateUserDto.username || user.email === updateUserDto.email) && user.userId !== userId);
        if (existingUser) {
            throw new BadRequestException('Username or email already in use');
        }

        const updatedUser = {
            ...this.users[userIndex],
            ...updateUserDto,
        };

        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            updatedUser.password = await bcrypt.hash(updateUserDto.password, salt);
        }

        this.users[userIndex] = updatedUser;
        return this.omitPassword(updatedUser);
    }

    async remove(userId: number): Promise<void> {
        const userIndex = this.users.findIndex(user => user.userId === userId);
        if (userIndex === -1) {
            throw new BadRequestException('User not found');
        }
        this.users.splice(userIndex, 1);
    }

    private omitPassword(user: User | undefined): User | undefined {
        if (!user) {
          return undefined;
        }
        const { password, ...result } = user;
        return result;
      }
      
}
