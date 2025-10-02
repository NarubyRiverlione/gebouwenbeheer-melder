import { IsEmail, IsOptional, IsString } from "class-validator"
import type { NewReport } from "./Report.js"

export class CreateReportDto implements Partial<NewReport> {
  @IsString()
  message!: string

  @IsOptional()
  @IsString()
  building?: string | null

  @IsOptional()
  @IsString()
  floor?: string | null

  @IsOptional()
  @IsString()
  apartment_Number?: string | null

  @IsOptional()
  @IsString()
  reporter_name?: string | null

  @IsOptional()
  @IsEmail()
  reporter_email?: string | null

  @IsOptional()
  @IsString()
  reporter_phone?: string | null

  @IsOptional()
  @IsString()
  category?: string | null

  @IsOptional()
  @IsString()
  priority?: string | null

  @IsOptional()
  @IsString()
  debugId?: string | null
}
