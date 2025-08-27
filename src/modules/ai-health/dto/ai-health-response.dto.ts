import { ApiProperty } from '@nestjs/swagger';
import { AiHealthInsight } from '../entities/ai-health-insight.entity';

export class AiHealthInsightResponseDto {
  @ApiProperty({
    description: 'AI health insight data',
    type: AiHealthInsight,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      pet_id: '456e7890-e89b-12d3-a456-426614174001',
      insight_type: 'health_alert',
      category: 'preventive_care',
      title: 'Weight Management Alert',
      description: 'Your pet has gained 2.5 lbs in the last 3 months. This could indicate overfeeding or reduced activity levels.',
      content: 'Based on recent weight measurements and activity data, your pet shows a concerning weight trend. Consider reviewing feeding portions and increasing exercise.',
      urgency_level: 'medium',
      confidence_score: 0.87,
      recommendations: [
        'Reduce daily food portions by 10%',
        'Increase daily exercise by 15 minutes',
        'Schedule a wellness checkup within 2 weeks'
      ],
      data_sources: ['weight_history', 'activity_tracking', 'feeding_logs'],
      is_actionable: true,
      requires_attention: true,
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:00.000Z'
    }
  })
  data!: AiHealthInsight;

  @ApiProperty({
    description: 'Success message',
    example: 'AI health insight retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthInsightsListResponseDto {
  @ApiProperty({
    description: 'List of AI health insights',
    type: [AiHealthInsight],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        pet_id: '456e7890-e89b-12d3-a456-426614174001',
        insight_type: 'health_alert',
        category: 'preventive_care',
        title: 'Weight Management Alert',
        urgency_level: 'medium',
        confidence_score: 0.87,
        is_actionable: true,
        requires_attention: true,
        created_at: '2024-01-15T10:30:00.000Z'
      },
      {
        id: '789e0123-e89b-12d3-a456-426614174002',
        pet_id: '456e7890-e89b-12d3-a456-426614174001',
        insight_type: 'wellness_reminder',
        category: 'vaccination',
        title: 'Vaccination Due Soon',
        urgency_level: 'low',
        confidence_score: 0.95,
        is_actionable: true,
        requires_attention: false,
        created_at: '2024-01-14T14:20:00.000Z'
      }
    ]
  })
  data!: AiHealthInsight[];

  @ApiProperty({
    description: 'Total number of insights',
    example: 45
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'AI health insights retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthAnalysisResponseDto {
  @ApiProperty({
    description: 'AI health analysis data',
    example: {
      petId: '456e7890-e89b-12d3-a456-426614174001',
      petName: 'Buddy',
      analysisDate: '2024-01-15T10:30:00.000Z',
      overallHealthScore: 85,
      healthTrends: {
        weight: { trend: 'increasing', change: '+2.5 lbs', period: '3 months' },
        activity: { trend: 'decreasing', change: '-15%', period: '1 month' },
        appetite: { trend: 'stable', change: '0%', period: '2 weeks' }
      },
      riskFactors: [
        { factor: 'Weight gain', risk: 'medium', description: 'Recent weight increase may indicate overfeeding' },
        { factor: 'Reduced activity', risk: 'low', description: 'Activity levels below normal range' }
      ],
      recommendations: [
        'Adjust feeding portions based on current weight',
        'Increase daily exercise routine',
        'Monitor weight weekly for next month'
      ],
      nextReviewDate: '2024-02-15T10:30:00.000Z'
    }
  })
  data!: {
    petId: string;
    petName: string;
    analysisDate: string;
    overallHealthScore: number;
    healthTrends: Record<string, {
      trend: string;
      change: string;
      period: string;
    }>;
    riskFactors: Array<{
      factor: string;
      risk: string;
      description: string;
    }>;
    recommendations: string[];
    nextReviewDate: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'AI health analysis completed successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthPredictionResponseDto {
  @ApiProperty({
    description: 'AI health prediction data',
    example: {
      petId: '456e7890-e89b-12d3-a456-426614174001',
      petName: 'Buddy',
      predictionDate: '2024-01-15T10:30:00.000Z',
      predictions: [
        {
          metric: 'Weight',
          currentValue: 65.5,
          predictedValue: 67.2,
          timeframe: '30 days',
          confidence: 0.78,
          trend: 'increasing',
          risk: 'medium'
        },
        {
          metric: 'Activity Level',
          currentValue: 45,
          predictedValue: 42,
          timeframe: '30 days',
          confidence: 0.82,
          trend: 'decreasing',
          risk: 'low'
        }
      ],
      healthForecast: {
        overallRisk: 'low',
        nextCheckup: '2024-02-15',
        preventiveActions: [
          'Monitor weight weekly',
          'Maintain current exercise routine',
          'Schedule wellness checkup'
        ]
      }
    }
  })
  data!: {
    petId: string;
    petName: string;
    predictionDate: string;
    predictions: Array<{
      metric: string;
      currentValue: number;
      predictedValue: number;
      timeframe: string;
      confidence: number;
      trend: string;
      risk: string;
    }>;
    healthForecast: {
      overallRisk: string;
      nextCheckup: string;
      preventiveActions: string[];
    };
  };

  @ApiProperty({
    description: 'Success message',
    example: 'AI health predictions generated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthRecommendationResponseDto {
  @ApiProperty({
    description: 'AI health recommendations data',
    example: {
      petId: '456e7890-e89b-12d3-a456-426614174001',
      petName: 'Buddy',
      recommendationDate: '2024-01-15T10:30:00.000Z',
      recommendations: [
        {
          id: 'rec_001',
          category: 'nutrition',
          title: 'Adjust Feeding Portions',
          description: 'Reduce daily food intake by 10% to manage weight gain',
          priority: 'high',
          impact: 'weight_management',
          implementation: 'Immediate - adjust tomorrow\'s feeding',
          expectedOutcome: 'Gradual weight stabilization over 2-3 weeks',
          followUp: 'Monitor weight weekly, adjust if needed'
        },
        {
          id: 'rec_002',
          category: 'exercise',
          title: 'Increase Daily Activity',
          description: 'Add 15 minutes of moderate exercise to daily routine',
          priority: 'medium',
          impact: 'fitness_improvement',
          implementation: 'Start this week, gradually increase',
          expectedOutcome: 'Improved energy levels and weight management',
          followUp: 'Track activity levels, adjust intensity as needed'
        }
      ],
      summary: {
        totalRecommendations: 2,
        highPriority: 1,
        mediumPriority: 1,
        estimatedTimeToImplement: '1 week',
        expectedHealthImprovement: '15-20%'
      }
    }
  })
  data!: {
    petId: string;
    petName: string;
    recommendationDate: string;
    recommendations: Array<{
      id: string;
      category: string;
      title: string;
      description: string;
      priority: string;
      impact: string;
      implementation: string;
      expectedOutcome: string;
      followUp: string;
    }>;
    summary: {
      totalRecommendations: number;
      highPriority: number;
      mediumPriority: number;
      estimatedTimeToImplement: string;
      expectedHealthImprovement: string;
    };
  };

  @ApiProperty({
    description: 'Success message',
    example: 'AI health recommendations generated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthMonitoringResponseDto {
  @ApiProperty({
    description: 'AI health monitoring data',
    example: {
      petId: '456e7890-e89b-12d3-a456-426614174001',
      petName: 'Buddy',
      monitoringPeriod: 'Last 30 days',
      metrics: {
        weight: {
          current: 65.5,
          average: 64.2,
          trend: 'increasing',
          alerts: ['Weight gain detected - 2.5 lbs in 3 months']
        },
        activity: {
          current: 45,
          average: 52,
          trend: 'decreasing',
          alerts: ['Activity below normal range']
        },
        appetite: {
          current: 'normal',
          average: 'normal',
          trend: 'stable',
          alerts: []
        }
      },
      alerts: [
        {
          type: 'warning',
          message: 'Weight gain trend detected',
          severity: 'medium',
          timestamp: '2024-01-15T10:30:00.000Z'
        }
      ],
      nextMonitoringDate: '2024-01-22T10:30:00.000Z'
    }
  })
  data!: {
    petId: string;
    petName: string;
    monitoringPeriod: string;
    metrics: Record<string, {
      current: any;
      average: any;
      trend: string;
      alerts: string[];
    }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: string;
      timestamp: string;
    }>;
    nextMonitoringDate: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'AI health monitoring data retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AiHealthReportResponseDto {
  @ApiProperty({
    description: 'AI health report data',
    example: {
      petId: '456e7890-e89b-12d3-a456-426614174001',
      petName: 'Buddy',
      reportDate: '2024-01-15T10:30:00.000Z',
      reportPeriod: 'December 15, 2023 - January 15, 2024',
      executiveSummary: 'Overall health is good with some areas for improvement. Weight management and activity levels need attention.',
      healthScore: 85,
      keyFindings: [
        'Weight increased by 2.5 lbs over 3 months',
        'Activity levels decreased by 15% in the last month',
        'Appetite and behavior remain normal'
      ],
      trends: {
        positive: ['Stable appetite', 'Good behavior'],
        concerning: ['Weight gain', 'Reduced activity'],
        neutral: ['Sleep patterns', 'Social interaction']
      },
      recommendations: [
        'Implement weight management plan',
        'Increase daily exercise routine',
        'Schedule follow-up in 2 weeks'
      ],
      nextSteps: [
        'Adjust feeding portions',
        'Create exercise schedule',
        'Monitor progress weekly'
      ]
    }
  })
  data!: {
    petId: string;
    petName: string;
    reportDate: string;
    reportPeriod: string;
    executiveSummary: string;
    healthScore: number;
    keyFindings: string[];
    trends: {
      positive: string[];
      concerning: string[];
      neutral: string[];
    };
    recommendations: string[];
    nextSteps: string[];
  };

  @ApiProperty({
    description: 'Success message',
    example: 'AI health report generated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}
