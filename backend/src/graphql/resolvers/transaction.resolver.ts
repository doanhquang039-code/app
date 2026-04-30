import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';

const pubSub = new PubSub();

@Resolver('Transaction')
export class TransactionResolver {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  @Query('transactions')
  async getTransactions(
    @Args('userId') userId: number,
    @Args('type') type?: string,
    @Args('startDate') startDate?: Date,
    @Args('endDate') endDate?: Date,
    @Args('limit') limit: number = 50,
    @Args('offset') offset: number = 0,
  ) {
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }

    const [transactions, totalCount] = await this.transactionRepo.findAndCount({
      where,
      take: limit,
      skip: offset,
      order: { date: 'DESC' },
    });

    return {
      edges: transactions.map((t, index) => ({
        node: t,
        cursor: Buffer.from(`${offset + index}`).toString('base64'),
      })),
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: transactions.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
        endCursor: transactions.length > 0 ? Buffer.from(`${offset + transactions.length - 1}`).toString('base64') : null,
      },
      totalCount,
    };
  }

  @Query('transaction')
  async getTransaction(@Args('id') id: number) {
    return await this.transactionRepo.findOne({ where: { id } });
  }

  @Mutation('createTransaction')
  async createTransaction(@Args('input') input: any) {
    const transaction = this.transactionRepo.create({
      ...input,
      date: input.date || new Date(),
    });

    const saved = await this.transactionRepo.save(transaction);

    // Publish to subscription
    pubSub.publish('transactionCreated', {
      transactionCreated: saved,
      userId: input.userId,
    });

    return saved;
  }

  @Mutation('updateTransaction')
  async updateTransaction(
    @Args('id') id: number,
    @Args('input') input: any,
  ) {
    await this.transactionRepo.update(id, input);
    const updated = await this.transactionRepo.findOne({ where: { id } });

    if (updated) {
      // Publish to subscription
      pubSub.publish('transactionUpdated', {
        transactionUpdated: updated,
        userId: updated.userId,
      });
    }

    return updated;
  }

  @Mutation('deleteTransaction')
  async deleteTransaction(@Args('id') id: number) {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    const result = await this.transactionRepo.delete(id);

    if (result.affected && result.affected > 0 && transaction) {
      // Publish to subscription
      pubSub.publish('transactionDeleted', {
        transactionDeleted: id,
        userId: transaction.userId,
      });
    }

    return result.affected ? result.affected > 0 : false;
  }

  @Subscription('transactionCreated', {
    filter: (payload, variables) => {
      return payload.userId === variables.userId;
    },
  })
  transactionCreated(@Args('userId') userId: number) {
    return pubSub.asyncIterator('transactionCreated');
  }

  @Subscription('transactionUpdated', {
    filter: (payload, variables) => {
      return payload.userId === variables.userId;
    },
  })
  transactionUpdated(@Args('userId') userId: number) {
    return pubSub.asyncIterator('transactionUpdated');
  }

  @Subscription('transactionDeleted', {
    filter: (payload, variables) => {
      return payload.userId === variables.userId;
    },
  })
  transactionDeleted(@Args('userId') userId: number) {
    return pubSub.asyncIterator('transactionDeleted');
  }
}
