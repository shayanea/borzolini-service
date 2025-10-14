# Swagger Documentation Examples

This directory contains centralized examples for Swagger documentation to keep DTOs clean and maintainable.

## Files

- `dto-examples.ts` - Contains all DTO-specific examples
- `swagger-examples.ts` - Contains API examples that reference DTO examples
- `README.md` - This documentation file

## Usage

### 1. Import Examples in DTOs

Instead of inline examples, import from the centralized examples:

```typescript
import { PET_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';

export class CreatePetDto {
 @ApiProperty({
 description: 'Name of the pet',
 example: PET_DTO_EXAMPLES.NAME,
 })
 name!: string;
}
```

### 2. Available Example Categories

#### Pet Examples

```typescript
import { PET_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';

// Available constants:
PET_DTO_EXAMPLES.NAME; // "Buddy"
PET_DTO_EXAMPLES.SPECIES; // "dog"
PET_DTO_EXAMPLES.BREED; // "Golden Retriever"
PET_DTO_EXAMPLES.GENDER; // "male"
PET_DTO_EXAMPLES.DATE_OF_BIRTH; // "2020-03-15"
PET_DTO_EXAMPLES.WEIGHT; // 45.5
PET_DTO_EXAMPLES.SIZE; // "medium"
PET_DTO_EXAMPLES.COLOR; // "Golden"
// ... and more
```

#### User Examples

```typescript
import { USER_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';

// Available constants:
USER_DTO_EXAMPLES.EMAIL; // "john.doe@example.com"
USER_DTO_EXAMPLES.FIRST_NAME; // "John"
USER_DTO_EXAMPLES.LAST_NAME; // "Doe"
USER_DTO_EXAMPLES.PHONE; // "+1234567890"
USER_DTO_EXAMPLES.ROLE; // "patient"
// ... and more
```

#### Common Examples

```typescript
import { COMMON_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';

// Available constants:
COMMON_DTO_EXAMPLES.UUID; // "123e4567-e89b-12d3-a456-426614174000"
COMMON_DTO_EXAMPLES.TIMESTAMP; // "2024-01-15T10:30:00.000Z"
COMMON_DTO_EXAMPLES.BOOLEAN; // true
COMMON_DTO_EXAMPLES.NUMBER; // 42
COMMON_DTO_EXAMPLES.STRING; // "example string"
```

### 3. Adding New Examples

When adding new examples:

1. **Add to `dto-examples.ts`** if it's a DTO-specific example
2. **Add to `swagger-examples.ts`** if it's a API example
3. **Use existing constants** when possible to maintain consistency

Example:

```typescript
// In dto-examples.ts
export const NEW_MODULE_DTO_EXAMPLES = {
 FIELD_NAME: 'example value',
 ANOTHER_FIELD: 123
};

// In your DTO
import { NEW_MODULE_DTO_EXAMPLES } from "../../../common/swagger/dto-examples";

@ApiProperty({
 description: "Field description",
 example: NEW_MODULE_DTO_EXAMPLES.FIELD_NAME
})
fieldName!: string;
```

### 4. Benefits

- **Clean DTOs**: No more inline examples cluttering your DTO files
- **Consistency**: All examples use the same values across the API
- **Maintainability**: Update examples in one place
- **Reusability**: Examples can be shared between different DTOs
- **Type Safety**: TypeScript ensures example values are correct

### 5. Migration Guide

To migrate existing DTOs:

1. **Identify inline examples** in your DTO files
2. **Add missing examples** to `dto-examples.ts`
3. **Replace inline examples** with imports from `dto-examples.ts`
4. **Test** that Swagger documentation still works correctly

### 6. Best Practices

- Use descriptive constant names (e.g., `PET_DTO_EXAMPLES.NAME` not `PET_DTO_EXAMPLES.STRING`)
- Group related examples together in the same object
- Keep examples realistic and representative of actual data
- Use consistent formatting for similar data types (dates, UUIDs, etc.)
- Document any special formatting requirements in comments

## Example Migration

### Before (Inline Examples)

```typescript
export class CreatePetDto {
 @ApiProperty({
 description: 'Name of the pet',
 example: 'Buddy',
 })
 name!: string;

 @ApiProperty({
 description: 'Species of the pet',
 example: 'dog',
 })
 species!: string;
}
```

### After (Centralized Examples)

```typescript
import { PET_DTO_EXAMPLES } from '../../../common/swagger/dto-examples';

export class CreatePetDto {
 @ApiProperty({
 description: 'Name of the pet',
 example: PET_DTO_EXAMPLES.NAME,
 })
 name!: string;

 @ApiProperty({
 description: 'Species of the pet',
 example: PET_DTO_EXAMPLES.SPECIES,
 })
 species!: string;
}
```

This approach makes your DTOs much cleaner and easier to maintain!
