import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

import { AiHealthService } from "./ai-health.service";
import { GenerateRecommendationsDto } from "./dto/generate-recommendations.dto";
import { UpdateInsightDto } from "./dto/update-insight.dto";
import {
  AiHealthInsight,
  InsightCategory,
} from "./entities/ai-health-insight.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("ai-health")
@Controller("ai-health")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiHealthController {
  constructor(private readonly aiHealthService: AiHealthService) {}

  @Post("recommendations")
  @ApiOperation({
    summary: "Generate AI-powered recommendations for a pet",
    description:
      "Generate personalized, AI-powered health and care recommendations based on pet profile, health history, and specific needs",
  })
  @ApiResponse({
    status: 201,
    description: "AI recommendations generated successfully",
    type: [AiHealthInsight],
  })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async generateRecommendations(
    @Body() dto: GenerateRecommendationsDto,
  ): Promise<AiHealthInsight[]> {
    return await this.aiHealthService.generateRecommendations(dto);
  }

  @Get("pets/:petId/insights")
  @ApiOperation({
    summary: "Get all AI insights for a specific pet",
    description:
      "Retrieve all AI-generated insights, recommendations, and alerts for a pet",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiQuery({
    name: "includeDismissed",
    required: false,
    description: "Include dismissed insights",
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: "Pet insights retrieved successfully",
    type: [AiHealthInsight],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getPetInsights(
    @Param("petId") petId: string,
    @Query("includeDismissed") includeDismissed: boolean = false,
  ): Promise<AiHealthInsight[]> {
    return await this.aiHealthService.getPetInsights(petId, includeDismissed);
  }

  @Get("pets/:petId/insights/category/:category")
  @ApiOperation({
    summary: "Get insights by category for a pet",
    description:
      "Retrieve AI insights filtered by specific category (health, nutrition, behavior, etc.)",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiParam({
    name: "category",
    description: "Category of insights to retrieve",
    enum: InsightCategory,
  })
  @ApiResponse({
    status: 200,
    description: "Category insights retrieved successfully",
    type: [AiHealthInsight],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet or category not found" })
  async getInsightsByCategory(
    @Param("petId") petId: string,
    @Param("category") category: InsightCategory,
  ): Promise<AiHealthInsight[]> {
    return await this.aiHealthService.getInsightsByCategory(petId, category);
  }

  @Get("pets/:petId/insights/urgent")
  @ApiOperation({
    summary: "Get urgent insights for a pet",
    description:
      "Retrieve only urgent AI insights that require immediate attention",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiResponse({
    status: 200,
    description: "Urgent insights retrieved successfully",
    type: [AiHealthInsight],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getUrgentInsights(
    @Param("petId") petId: string,
  ): Promise<AiHealthInsight[]> {
    return await this.aiHealthService.getUrgentInsights(petId);
  }

  @Get("pets/:petId/insights/summary")
  @ApiOperation({
    summary: "Get insights summary for dashboard",
    description:
      "Get a summary of AI insights including counts and recent insights for dashboard display",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiResponse({
    status: 200,
    description: "Insights summary retrieved successfully",
    schema: {
      type: "object",
      properties: {
        total: { type: "number" },
        urgent: { type: "number" },
        recommendations: { type: "number" },
        alerts: { type: "number" },
        recent: {
          type: "array",
          items: { $ref: "#/components/schemas/AiHealthInsight" },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getInsightsSummary(@Param("petId") petId: string) {
    return await this.aiHealthService.getInsightsSummary(petId);
  }

  @Put("insights/:insightId")
  @ApiOperation({
    summary: "Update AI insight with owner feedback",
    description:
      "Allow pet owners to provide feedback, dismiss insights, or mark them as acted upon",
  })
  @ApiParam({ name: "insightId", description: "ID of the AI insight" })
  @ApiResponse({
    status: 200,
    description: "Insight updated successfully",
    type: AiHealthInsight,
  })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Insight not found" })
  async updateInsight(
    @Param("insightId") insightId: string,
    @Body() updateDto: UpdateInsightDto,
  ): Promise<AiHealthInsight> {
    return await this.aiHealthService.updateInsight(insightId, updateDto);
  }

  @Post("pets/:petId/insights/refresh")
  @ApiOperation({
    summary: "Refresh AI insights for a pet",
    description:
      "Regenerate AI recommendations based on updated pet data and health history",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiResponse({
    status: 201,
    description: "AI insights refreshed successfully",
    type: [AiHealthInsight],
  })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async refreshInsights(
    @Param("petId") petId: string,
  ): Promise<AiHealthInsight[]> {
    // Generate fresh recommendations with default settings
    const dto: GenerateRecommendationsDto = {
      pet_id: petId,
      include_emergency_alerts: true,
      include_preventive_care: true,
      include_lifestyle_tips: true,
    };

    return await this.aiHealthService.generateRecommendations(dto);
  }

  @Get("dashboard/:petId")
  @ApiOperation({
    summary: "Get comprehensive AI health dashboard",
    description:
      "Get a complete AI health dashboard including insights summary, recent recommendations, and health trends",
  })
  @ApiParam({ name: "petId", description: "ID of the pet" })
  @ApiResponse({
    status: 200,
    description: "AI health dashboard retrieved successfully",
    schema: {
      type: "object",
      properties: {
        insightsSummary: {
          type: "object",
          properties: {
            total: { type: "number" },
            urgent: { type: "number" },
            recommendations: { type: "number" },
            alerts: { type: "number" },
            recent: {
              type: "array",
              items: { $ref: "#/components/schemas/AiHealthInsight" },
            },
          },
        },
        urgentInsights: {
          type: "array",
          items: { $ref: "#/components/schemas/AiHealthInsight" },
        },
        recentRecommendations: {
          type: "array",
          items: { $ref: "#/components/schemas/AiHealthInsight" },
        },
        healthScore: { type: "number" },
        nextActions: { type: "array", items: { type: "string" } },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async getAiHealthDashboard(@Param("petId") petId: string) {
    const [insightsSummary, urgentInsights, recentRecommendations] =
      await Promise.all([
        this.aiHealthService.getInsightsSummary(petId),
        this.aiHealthService.getUrgentInsights(petId),
        this.aiHealthService.getInsightsByCategory(
          petId,
          InsightCategory.HEALTH,
        ),
      ]);

    // Calculate health score based on insights
    const healthScore = this.calculateHealthScore(
      insightsSummary,
      urgentInsights,
    );

    // Generate next actions
    const nextActions = this.generateNextActions(
      urgentInsights,
      recentRecommendations,
    );

    return {
      insightsSummary,
      urgentInsights,
      recentRecommendations,
      healthScore,
      nextActions,
    };
  }

  /**
   * Calculate a health score based on insights and alerts
   */
  private calculateHealthScore(
    summary: any,
    urgentInsights: AiHealthInsight[],
  ): number {
    let score = 100;

    // Deduct points for urgent alerts
    score -= urgentInsights.length * 15;

    // Deduct points for high urgency insights
    if (summary.alerts > 0) {
      score -= summary.alerts * 5;
    }

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Generate actionable next steps for pet owners
   */
  private generateNextActions(
    urgentInsights: AiHealthInsight[],
    recentRecommendations: AiHealthInsight[],
  ): string[] {
    const actions: string[] = [];

    // Add urgent actions first
    urgentInsights.forEach((insight) => {
      if (insight.suggested_action) {
        actions.push(`URGENT: ${insight.suggested_action}`);
      }
    });

    // Add recent recommendations
    recentRecommendations.slice(0, 3).forEach((insight) => {
      if (
        insight.suggested_action &&
        !actions.includes(insight.suggested_action)
      ) {
        actions.push(insight.suggested_action);
      }
    });

    // Add default actions if none exist
    if (actions.length === 0) {
      actions.push("Schedule regular wellness checkup");
      actions.push("Review vaccination schedule");
      actions.push("Monitor pet behavior and appetite");
    }

    return actions.slice(0, 5); // Limit to 5 actions
  }
}
