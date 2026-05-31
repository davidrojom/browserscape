import { Body, Controller, Post } from "@nestjs/common";
import { AnalyzeDto } from "./analyze.dto.js";
import { AnalyzeService, type AnalyzeResponse } from "./analyze.service.js";

@Controller()
export class AnalyzeController {
  constructor(private readonly service: AnalyzeService) {}

  @Post("analyze")
  analyze(@Body() dto: AnalyzeDto): Promise<AnalyzeResponse> {
    return this.service.analyze(dto);
  }
}
