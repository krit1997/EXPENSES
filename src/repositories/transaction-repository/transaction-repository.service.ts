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
import { TransactionEntity } from '../../databases/entities/TransactionEntity';

@Injectable()
export class TransactionRepositoryService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async save(transaction: TransactionEntity) {
    return this.transactionRepository.save(transaction);
  }

  async findOne(
    options: FindOneOptions<TransactionEntity>,
  ): Promise<TransactionEntity | null> {
    return await this.transactionRepository.findOne(options);
  }

  async findAll(
    options: FindManyOptions<TransactionEntity>,
  ): Promise<TransactionEntity[]> {
    return await this.transactionRepository.find(options);
  }

  async delete(
    entity: TransactionEntity,
    options?: RemoveOptions,
  ): Promise<TransactionEntity> {
    return await this.transactionRepository.remove(entity, options);
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
      | FindOptionsWhere<TransactionEntity>,
    partialEntity: Partial<TransactionEntity>,
  ): Promise<UpdateResult> {
    return await this.transactionRepository.update(criteria, partialEntity);
  }
}
