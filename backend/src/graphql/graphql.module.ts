import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TransactionResolver } from './resolvers/transaction.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Budget } from '../entities/budget.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql/graphql.ts'),
        outputAs: 'class',
      },
      playground: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, connection }) => {
        if (connection) {
          return { req: connection.context };
        }
        return { req };
      },
    }),
    TypeOrmModule.forFeature([Transaction, User, Budget]),
  ],
  providers: [TransactionResolver],
})
export class GraphqlModule {}
