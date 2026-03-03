import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Проверяем, существует ли пользователь с таким email
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Проверяем, существует ли пользователь с таким username
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException(
        'Пользователь с таким username уже существует',
      );
    }

    // Хешируем пароль
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Создаем пользователя
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    // Если обновляем username, проверяем уникальность
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: updateData.username },
      });
      if (existingUsername) {
        throw new ConflictException(
          'Пользователь с таким username уже существует',
        );
      }
    }

    // Если обновляем email, проверяем уникальность
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateData.email.toLowerCase() },
      });
      if (existingEmail) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }
}
