# Testing Strategy for BMS

This document outlines the testing strategy and practices for the Business Management System (BMS).

## Test Types

### Unit Tests
Unit tests focus on testing individual components or functions in isolation. We use:
- **Vitest** for the web app and API packages
- **Jest** for the mobile app

Unit tests should be:
- Fast to run
- Deterministic and repeatable
- Focused on a single functionality
- Independent of external dependencies (mocked)

### Integration Tests
Integration tests verify that multiple components work together correctly. We use:
- **Vitest** for API and service layer integration tests
- **React Testing Library** for component integration

Integration tests should:
- Test interactions between components or services
- Use real implementations where possible, mocking only external dependencies
- Cover edge cases and error scenarios

### End-to-End (E2E) Tests
E2E tests verify the application from the user's perspective, testing the entire user flow. We use:
- **Playwright** for web E2E tests

E2E tests should:
- Test complete user journeys
- Simulate real user interactions
- Test across different browsers (Chromium, Firefox, Safari)
- Cover critical business workflows

## Test Coverage Goals
- **Unit Tests**: 80% of code coverage
- **Integration Tests**: 60% of code coverage
- **E2E Tests**: All critical user flows

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests
npm run test

# Run tests in a specific package
npm run test
working-directory: apps/web

# Run tests in watch mode
npm run test -- --watch
```

### End-to-End Tests
```bash
# Install Playwright browsers (only needed once)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run a specific E2E test file
npm run test:e2e -- pos-flow.spec.ts
```

## Test File Organization
- **Unit Tests**: Located in `__tests__` directories next to the code they're testing
- **Integration Tests**: Also in `__tests__` directories with clear naming like `component.integration.test.tsx`
- **E2E Tests**: Located in `tests/e2e` directory at the application root

## Test Data and Mocks
- **Database**: We use in-memory SQLite database or mocked responses for tests
- **API Calls**: All external API calls are mocked using Jest/Vitest mocking
- **File System**: Use temporary directories for file operations

## Continuous Integration
Our CI/CD pipeline runs all tests on every pull request and commit to main. Tests must pass before deployment.

## Best Practices
1. **Test Naming**: Test files should follow the pattern `*.test.ts` or `*.test.tsx`
2. **Test Description**: Use descriptive test names that explain what is being tested
3. **Test Independence**: Each test should be independent and not rely on the state of other tests
4. **Test Data**: Use factories or fixtures to create test data
5. **Assertions**: Use specific assertions that clearly indicate what is being tested
6. **Mocking**: Mock external dependencies but test real implementation where possible
7. **Test Maintenance**: Keep tests updated when the code they test changes

## Example Test

```typescript
// Example unit test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getProductById } from '../inventory'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}))

describe('getProductById', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns a product by id', async () => {
    const mockProduct = { id: '1', name: 'Product 1' }
    const mockSingle = vi.fn().mockResolvedValue({ data: mockProduct, error: null })
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as any)

    const product = await getProductById('1')

    expect(product).toEqual(mockProduct)
    expect(mockSingle).toHaveBeenCalled()
  })
})