import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetAlertDto } from './create-budget-alert.dto';

export class UpdateBudgetAlertDto extends PartialType(CreateBudgetAlertDto) {}
