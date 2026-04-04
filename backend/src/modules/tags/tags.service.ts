import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(userId: number, dto: CreateTagDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Tên tag không được để trống');
    }

    const tag = this.tagRepository.create({
      userId,
      name: dto.name.trim(),
      color: dto.color,
      icon: dto.icon,
    });

    return await this.tagRepository.save(tag);
  }

  async findAll(userId: number) {
    return await this.tagRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: number, id: number) {
    const tag = await this.tagRepository.findOne({
      where: { id, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag không tìm thấy');
    }
    return tag;
  }

  async update(userId: number, id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(userId, id);

    if (dto.name) {
      if (dto.name.trim().length === 0) {
        throw new BadRequestException('Tên tag không được để trống');
      }
      tag.name = dto.name.trim();
    }

    if (dto.color) tag.color = dto.color;
    if (dto.icon) tag.icon = dto.icon;

    return await this.tagRepository.save(tag);
  }

  async remove(userId: number, id: number) {
    const tag = await this.findOne(userId, id);
    await this.tagRepository.remove(tag);
    return { message: 'Đã xóa tag' };
  }
}
