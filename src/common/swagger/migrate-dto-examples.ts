#!/usr/bin/env ts-node

/**
 * Migration Script: Convert DTOs to use centralized examples
 *
 * This script helps identify DTOs that still have inline examples
 * and provides guidance on how to migrate them.
 *
 * Usage: pnpm ts-node src/common/swagger/migrate-dto-examples.ts
 */

import * as fs from 'fs';
import * as glob from 'glob';

interface DTOFile {
  path: string;
  inlineExamples: string[];
  suggestions: string[];
}

class DTOExampleMigrator {
  private dtoFiles: DTOFile[] = [];

  /**
   * Scan all DTO files for inline examples
   */
  scanDTOFiles(): void {
    console.log('🔍 Scanning for DTO files with inline examples...\n');

    const dtoPattern = 'src/**/*.dto.ts';
    const files = glob.sync(dtoPattern);

    files.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const inlineExamples = this.extractInlineExamples(content);

      if (inlineExamples.length > 0) {
        const suggestions = this.generateMigrationSuggestions(filePath, inlineExamples);
        this.dtoFiles.push({
          path: filePath,
          inlineExamples,
          suggestions,
        });
      }
    });
  }

  /**
   * Extract inline examples from DTO content
   */
  private extractInlineExamples(content: string): string[] {
    const examples: string[] = [];

    // Find @ApiProperty with example
    const apiPropertyRegex = /@ApiProperty\s*\(\s*{[^}]*example\s*:\s*([^,}]+)[^}]*\s*\)/g;
    let match;

    while ((match = apiPropertyRegex.exec(content)) !== null) {
      const exampleValue = match[1].trim();
      if (exampleValue && !exampleValue.includes('DTO_EXAMPLES')) {
        examples.push(exampleValue);
      }
    }

    // Find @ApiPropertyOptional with example
    const apiPropertyOptionalRegex = /@ApiPropertyOptional\s*\(\s*{[^}]*example\s*:\s*([^,}]+)[^}]*\s*\)/g;

    while ((match = apiPropertyOptionalRegex.exec(content)) !== null) {
      const exampleValue = match[1].trim();
      if (exampleValue && !exampleValue.includes('DTO_EXAMPLES')) {
        examples.push(exampleValue);
      }
    }

    return examples;
  }

  /**
   * Generate migration suggestions for a DTO file
   */
  private generateMigrationSuggestions(filePath: string, examples: string[]): string[] {
    const suggestions: string[] = [];
    const moduleName = this.extractModuleName(filePath);

    examples.forEach((example) => {
      const cleanExample = example.replace(/['"]/g, '').trim();

      if (cleanExample.includes('@')) {
        // Skip enum references
        return;
      }

      if (this.isCommonExample(cleanExample)) {
        suggestions.push(`Replace "${cleanExample}" with COMMON_DTO_EXAMPLES.${this.getCommonExampleKey(cleanExample)}`);
      } else if (moduleName) {
        suggestions.push(`Add "${cleanExample}" to ${moduleName.toUpperCase()}_DTO_EXAMPLES in dto-examples.ts`);
      } else {
        suggestions.push(`Add "${cleanExample}" to appropriate DTO_EXAMPLES in dto-examples.ts`);
      }
    });

    return suggestions;
  }

  /**
   * Extract module name from file path
   */
  private extractModuleName(filePath: string): string | null {
    const match = filePath.match(/src\/modules\/([^\/]+)\//);
    return match ? match[1] : null;
  }

  /**
   * Check if example is a common pattern
   */
  private isCommonExample(example: string): boolean {
    const commonPatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // Date format
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // ISO timestamp
      /^https?:\/\/.+/, // URL
      /^\+?\d{10,15}$/, // Phone number
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email
      /^(true|false)$/i, // Boolean
      /^\d+(\.\d+)?$/, // Number
    ];

    return commonPatterns.some((pattern) => pattern.test(example));
  }

  /**
   * Get common example key for a value
   */
  private getCommonExampleKey(example: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(example)) return 'DATE';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(example)) return 'UUID';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(example)) return 'TIMESTAMP';
    if (/^https?:\/\/.+/.test(example)) return 'URL';
    if (/^\+?\d{10,15}$/.test(example)) return 'PHONE';
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(example)) return 'EMAIL';
    if (/^(true|false)$/i.test(example)) return 'BOOLEAN';
    if (/^\d+(\.\d+)?$/.test(example)) return 'NUMBER';
    return 'STRING';
  }

  /**
   * Generate migration report
   */
  generateReport(): void {
    if (this.dtoFiles.length === 0) {
      console.log('✅ No DTOs with inline examples found! All DTOs are already using centralized examples.');
      return;
    }

    console.log(`📊 Found ${this.dtoFiles.length} DTO files with inline examples:\n`);

    this.dtoFiles.forEach((dtoFile, index) => {
      console.log(`${index + 1}. ${dtoFile.path}`);
      console.log(`   Inline examples found: ${dtoFile.inlineExamples.length}`);

      if (dtoFile.suggestions.length > 0) {
        console.log('   Migration suggestions:');
        dtoFile.suggestions.forEach((suggestion) => {
          console.log(`     • ${suggestion}`);
        });
      }

      console.log('');
    });

    console.log('🚀 Migration Steps:');
    console.log('1. Add missing examples to src/common/swagger/dto-examples.ts');
    console.log('2. Import DTO_EXAMPLES in your DTO files');
    console.log('3. Replace inline examples with DTO_EXAMPLES constants');
    console.log('4. Test that Swagger documentation still works correctly');
    console.log('\n📚 See src/common/swagger/README.md for detailed migration guide');
  }

  /**
   * Run the migration scanner
   */
  run(): void {
    try {
      this.scanDTOFiles();
      this.generateReport();
    } catch (error) {
      console.error('❌ Error during migration scan:', error);
    }
  }
}

// Run the migrator if this script is executed directly
if (require.main === module) {
  const migrator = new DTOExampleMigrator();
  migrator.run();
}

export { DTOExampleMigrator };
