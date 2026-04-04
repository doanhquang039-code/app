import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsService {
    private tagRepository;
    constructor(tagRepository: Repository<Tag>);
    create(userId: number, dto: CreateTagDto): Promise<Tag>;
    findAll(userId: number): Promise<Tag[]>;
    findOne(userId: number, id: number): Promise<Tag>;
    update(userId: number, id: number, dto: UpdateTagDto): Promise<Tag>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
}
