import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'testpass',
      email: 'testuser@example.com',
      name: 'Test User'
    };
    const user = await service.create(createUserDto);
    expect(user).toHaveProperty('userId');
    expect(user).not.toHaveProperty('password');
  });

  it('should not create a user with existing username or email', async () => {
    const createUserDto: CreateUserDto = {
      username: 'john',
      password: 'testpass',
      email: 'john@example.com',
      name: 'John Test'
    };
    await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'John Updated'
    };
    const user = await service.update(1, updateUserDto);
    expect(user).toHaveProperty('name', 'John Updated');
  });

  it('should delete a user', async () => {
    await service.remove(1);
    const user = await service.findOneById(1);
    expect(user).toBeUndefined();
  });
});
