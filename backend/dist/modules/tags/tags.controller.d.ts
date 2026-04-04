import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsController {
    private tagsService;
    constructor(tagsService: TagsService);
    create(req: any, dto: CreateTagDto): Promise<import("../../entities/tag.entity").Tag>;
    findAll(req: any): Promise<import("../../entities/tag.entity").Tag[]>;
    findOne(req: any, id: string): Promise<import("../../entities/tag.entity").Tag>;
    update(req: any, id: string, dto: UpdateTagDto): Promise<import("../../entities/tag.entity").Tag>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
