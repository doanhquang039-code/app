import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<import("../../entities/category.entity").Category[]>;
    create(req: any, dto: CreateCategoryDto): Promise<import("../../entities/category.entity").Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("../../entities/category.entity").Category>;
    remove(id: number): Promise<void>;
}
