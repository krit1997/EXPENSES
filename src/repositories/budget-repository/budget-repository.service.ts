import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  RemoveOptions,
  Repository,
} from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { BudgetEntity } from '../../databases/entities/BudgetEntity';

@Injectable()
export class BudgetRepositoryService {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
  ) {}

  async save(budget: BudgetEntity) {
    return this.budgetRepository.save(budget);
  }

  async findOne(
    options: FindOneOptions<BudgetEntity>,
  ): Promise<BudgetEntity | null> {
    return await this.budgetRepository.findOne(options);
  }

  async findAll(
    options: FindManyOptions<BudgetEntity>,
  ): Promise<BudgetEntity[]> {
    return await this.budgetRepository.find(options);
  }

  async delete(
    entity: BudgetEntity,
    options?: RemoveOptions,
  ): Promise<BudgetEntity> {
    return await this.budgetRepository.remove(entity, options);
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
      | FindOptionsWhere<BudgetEntity>,
    partialEntity: Partial<BudgetEntity>,
  ): Promise<UpdateResult> {
    return await this.budgetRepository.update(criteria, partialEntity);
  }
}
