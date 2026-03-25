import { faker } from '@faker-js/faker';
import type { CreateUserRequest } from '../../api/models/user.model';

/**
 * UserFactory — generates realistic, randomised test data using Faker.
 *
 * Factory functions (rather than hard-coded fixtures) prevent test pollution
 * caused by shared state and make data-driven tests trivially easy to write.
 *
 * Faker is seeded deterministically in CI via FAKER_SEED so failures are
 * reproducible — set process.env.FAKER_SEED to a number to pin the seed.
 */

if (process.env.FAKER_SEED) {
  faker.seed(parseInt(process.env.FAKER_SEED, 10));
}

export const UserFactory = {
  /**
   * Build a single CreateUserRequest with random but realistic values.
   * Pass overrides to pin specific fields while randomising the rest.
   */
  build(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
    return {
      name: faker.person.fullName(),
      job: faker.person.jobTitle(),
      ...overrides,
    };
  },

  /**
   * Build an array of CreateUserRequest objects.
   * Useful for data-driven / parameterised tests.
   */
  buildMany(count: number, overrides: Partial<CreateUserRequest> = {}): CreateUserRequest[] {
    return Array.from({ length: count }, () => UserFactory.build(overrides));
  },

  /** Build a user with an intentionally invalid payload (empty strings). */
  buildInvalid(): Partial<CreateUserRequest> {
    return { name: '', job: '' };
  },
};
