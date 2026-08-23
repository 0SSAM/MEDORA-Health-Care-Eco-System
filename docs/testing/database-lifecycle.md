# Database lifecycle integration testing

## Purpose

The protected-router integration suite is designed to validate persisted organization and jurisdiction isolation, authenticated memberships, denial of cross-tenant access, and cleanup. It is intentionally separate from the unit and mocked-router suites.

## Required configuration

Use a disposable MySQL, MySQL-compatible, or MariaDB database created specifically for tests. Set both variables only in the test environment:

```bash
export TEST_DATABASE_URL='mysql://test_user:test_password@test-db.local/aldo_test'
export TEST_DATABASE_ISOLATED='true'
```

The harness refuses to open a connection unless `TEST_DATABASE_ISOLATED` is exactly `true`. It accepts only MySQL-compatible URLs and rejects production-like host names such as `prod`, `production`, `live`, and `primary`. A production URL, shared staging database, or database containing real patient, customer, employee, prescription, or financial data must never be used.

## Execution

Run the full suite with:

```bash
pnpm test
```

The schema-boundary suite is skipped when the isolated test variables are unavailable. This is a safe and explicit skip, not a passing claim for persisted lifecycle coverage. Once an isolated database is available, the suite must be run again and its output retained with the checkpoint that records the result.

## Cleanup expectations

Integration tests must use uniquely generated test identities and organization/jurisdiction fixtures, avoid real personal data, and remove every temporary record they create. Tests that mutate state should run inside a rollback-capable transaction where the procedure under test permits it, or execute an explicit cleanup in `afterEach`/`afterAll`. Cleanup failures must fail the test rather than be silently ignored.

The current schema-boundary checks are read-only and verify required organization and jurisdiction columns. They do not replace the pending protected tRPC lifecycle test, which requires the isolated database URL and explicit rollback/cleanup assertions.
