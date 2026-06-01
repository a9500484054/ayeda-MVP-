// apps/backend/src/modules/users/users.service.ts
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
import { cacheGetOrSet, clearCachePattern } from '../../utils/redis.utils';
import { UsersCacheService } from './users.cache.service'; // Добавьте импорт

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersCacheService: UsersCacheService, // Добавьте в конструктор
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

    const savedUser = await this.usersRepository.save(user);

    // Очищаем кэш через сервис
    await this.usersCacheService.clearAllUsersCache();

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return cacheGetOrSet(
      'users:all:list',
      async () => {
        return this.usersRepository.find();
      },
      300
    );
  }

  async findOne(id: string): Promise<User> {
    return cacheGetOrSet(
      `user:${id}`,
      async () => {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException('Пользователь не найден');
        }
        return user;
      },
      3600
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email.toLowerCase()}`;
    return cacheGetOrSet(
      cacheKey,
      async () => {
        return this.usersRepository.findOne({
          where: { email: email.toLowerCase() },
        });
      },
      3600
    );
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
    const updatedUser = await this.usersRepository.save(user);

    // Очищаем кэш через сервис
    await this.usersCacheService.clearUserCache(id, updateData.email || user.email);

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);

    // Очищаем кэш через сервис
    await this.usersCacheService.clearUserCache(id, user.email);
  }

  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[User[], number]> {
    const cacheKey = `users:all:${page}:${limit}`;

    return cacheGetOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        return this.usersRepository.findAndCount({
          skip,
          take: limit,
          order: { createdAt: 'DESC' },
        });
      },
      300
    );
  }
}
