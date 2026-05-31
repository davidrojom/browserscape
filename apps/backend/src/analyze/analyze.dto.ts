import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";

export class AnalyzeDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  url!: string;

  @IsOptional()
  @IsString()
  browserslist?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  maxDepth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  maxPages?: number;
}
