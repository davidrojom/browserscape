import { Module } from "@nestjs/common";
import { AnalyzeCommand } from "./analyze.command.js";
import { AnalyzeService } from "./analyze.service.js";

@Module({ providers: [AnalyzeCommand, AnalyzeService] })
export class AppModule {}
