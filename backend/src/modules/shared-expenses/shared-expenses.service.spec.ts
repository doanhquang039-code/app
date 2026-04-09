import { Test, TestingModule } from '@nestjs/testing';
import { SharedExpensesService } from './shared-expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SharedExpenseGroup, SharedExpense, GroupSettlement } from '../../entities/shared-expense.entity';
import { User } from '../../entities/user.entity';

describe('SharedExpensesService', () => {
  let service: SharedExpensesService;

  const mockGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockExpenseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockSettlementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedExpensesService,
        {
          provide: getRepositoryToken(SharedExpenseGroup),
          useValue: mockGroupRepository,
        },
        {
          provide: getRepositoryToken(SharedExpense),
          useValue: mockExpenseRepository,
        },
        {
          provide: getRepositoryToken(GroupSettlement),
          useValue: mockSettlementRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SharedExpensesService>(SharedExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    it('should create a shared expense group', async () => {
      const ownerId = 1;
      const groupDto = {
        groupName: 'Trip to Vegas',
        description: 'Shared expenses for trip',
      };

      mockGroupRepository.create.mockReturnValue({
        ownerId,
        ...groupDto,
      });

      mockGroupRepository.save.mockResolvedValue({
        id: 1,
        ownerId,
        ...groupDto,
        members: [],
      });

      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, name: 'User 1' });

      const result = await service.createGroup(ownerId, groupDto);

      expect(result).toBeDefined();
      expect(result.groupName).toBe('Trip to Vegas');
    });
  });

  describe('createSharedExpense', () => {
    it('should create a shared expense', async () => {
      const userId = 1;
      const groupId = 1;
      const expenseDto = {
        description: 'Hotel',
        amount: 300,
        splits: JSON.stringify({ 1: 100, 2: 100, 3: 100 }),
      };

      mockExpenseRepository.create.mockReturnValue({
        userId,
        groupId,
        ...expenseDto,
        paidByUserId: userId,
      });

      mockExpenseRepository.save.mockResolvedValue({
        id: 1,
        userId,
        groupId,
        ...expenseDto,
        paidByUserId: userId,
      });

      mockGroupRepository.findOne.mockResolvedValue({
        id: groupId,
        totalAmount: 300,
      });

      mockSettlementRepository.create.mockReturnValue({});
      mockSettlementRepository.save.mockResolvedValue({});

      const result = await service.createSharedExpense(userId, groupId, expenseDto);

      expect(result).toBeDefined();
      expect(result.amount).toBe(300);
    });
  });
});
