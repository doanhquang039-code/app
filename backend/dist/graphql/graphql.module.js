"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const transaction_resolver_1 = require("./resolvers/transaction.resolver");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const user_entity_1 = require("../entities/user.entity");
const budget_entity_1 = require("../entities/budget.entity");
let GraphqlModule = class GraphqlModule {
};
exports.GraphqlModule = GraphqlModule;
exports.GraphqlModule = GraphqlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                typePaths: ['./**/*.graphql'],
                definitions: {
                    path: (0, path_1.join)(process.cwd(), 'src/graphql/graphql.ts'),
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
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, user_entity_1.User, budget_entity_1.Budget]),
        ],
        providers: [transaction_resolver_1.TransactionResolver],
    })
], GraphqlModule);
//# sourceMappingURL=graphql.module.js.map