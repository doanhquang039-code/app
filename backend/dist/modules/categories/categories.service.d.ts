import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
export declare class CategoriesService {
    private categoryRepo;
    constructor(categoryRepo: Repository<Category>);
    findAll(userId: number): Promise<Category[]>;
    create(userId: number, dto: CreateCategoryDto): Promise<Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<Category>;
    remove(id: number): Promise<void>;
}
