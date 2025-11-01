import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  RemoveOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CategoryEntity } from '../../databases/entities/CategoryEntity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async save(category: CategoryEntity) {
    return this.categoryRepository.save(category);
  }

  async findOne(
    options: FindOneOptions<CategoryEntity>,
  ): Promise<CategoryEntity | null> {
    return await this.categoryRepository.findOne(options);
  }

  async findAll(
    options: FindManyOptions<CategoryEntity>,
  ): Promise<CategoryEntity[]> {
    return await this.categoryRepository.find(options);
  }

  async delete(
    entity: CategoryEntity,
    options?: RemoveOptions,
  ): Promise<CategoryEntity> {
    return await this.categoryRepository.remove(entity, options);
  }

  async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<CategoryEntity>,
    partialEntity: Partial<CategoryEntity>,
  ): Promise<UpdateResult> {
    return await this.categoryRepository.update(criteria, partialEntity);
  }
}
