import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(userId: number): Promise<Category[]> {
    return this.categoryRepo.find({
      where: [
        { userId, isActive: true },
        { isDefault: true, isActive: true },
      ],
      relations: ['children'],
    });
  }

  async create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create({ ...dto, userId });
    return this.categoryRepo.save(category) as unknown as Category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    await this.categoryRepo.update(id, dto);
    const category = await this.categoryRepo.findOne({ where: { id } });
    return category!;
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepo.update(id, { isActive: false });
  }
}
