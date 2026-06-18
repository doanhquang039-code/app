import { Test, TestingModule } from '@nestjs/testing';
import { SharedExpensesService } from './shared-expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SharedExpenseGroup, SharedExpense, GroupSettlement } from '../../entities/shared-expense.entity';
import { User } from '../../entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('SharedExpensesService', () => {
  let service: SharedExpensesService;

  const mockGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    const groupDto = {
      groupName: 'Trip to Vegas',
      description: 'Shared expenses for trip',
    };

    it('should create a group successfully when user has no existing groups', async () => {
      const ownerId = 1;
      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, role: 'user' });
      mockGroupRepository.count.mockResolvedValue(0);
      mockGroupRepository.create.mockReturnValue({ ownerId, ...groupDto });
      mockGroupRepository.save.mockResolvedValue({ id: 1, ownerId, ...groupDto, members: [] });

      const result = await service.createGroup(ownerId, groupDto);

      expect(result).toBeDefined();
      expect(result.groupName).toBe('Trip to Vegas');
      expect(mockGroupRepository.count).toHaveBeenCalledWith({ where: { ownerId } });
    });

    it('should create a second group successfully for a standard user (count=1)', async () => {
      const ownerId = 2;
      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, role: 'user' });
      mockGroupRepository.count.mockResolvedValue(1); // 1 nhóm đã tồn tại
      mockGroupRepository.create.mockReturnValue({ ownerId, ...groupDto });
      mockGroupRepository.save.mockResolvedValue({ id: 2, ownerId, ...groupDto, members: [] });

      const result = await service.createGroup(ownerId, groupDto);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when standard user already has 2 groups (count=2)', async () => {
      const ownerId = 3;
      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, role: 'user' });
      mockGroupRepository.count.mockResolvedValue(2); // đã đủ 2 nhóm

      await expect(service.createGroup(ownerId, groupDto)).rejects.toThrow(BadRequestException);
      await expect(service.createGroup(ownerId, groupDto)).rejects.toThrow(
        'Mỗi tài khoản thường chỉ được tạo tối đa 2 nhóm.',
      );
    });

    it('should allow premium user to create a third group (count=2)', async () => {
      const ownerId = 4;
      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, role: 'premium' });
      mockGroupRepository.count.mockResolvedValue(2);
      mockGroupRepository.create.mockReturnValue({ ownerId, ...groupDto });
      mockGroupRepository.save.mockResolvedValue({ id: 3, ownerId, ...groupDto, members: [] });

      const result = await service.createGroup(ownerId, groupDto);
      expect(result).toBeDefined();
      // Premium users should NOT have count checked
      expect(mockGroupRepository.count).not.toHaveBeenCalled();
    });

    it('should allow admin user to create unlimited groups', async () => {
      const ownerId = 5;
      mockUserRepository.findOne.mockResolvedValue({ id: ownerId, role: 'admin' });
      mockGroupRepository.count.mockResolvedValue(10);
      mockGroupRepository.create.mockReturnValue({ ownerId, ...groupDto });
      mockGroupRepository.save.mockResolvedValue({ id: 11, ownerId, ...groupDto, members: [] });

      const result = await service.createGroup(ownerId, groupDto);
      expect(result).toBeDefined();
      expect(mockGroupRepository.count).not.toHaveBeenCalled();
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
