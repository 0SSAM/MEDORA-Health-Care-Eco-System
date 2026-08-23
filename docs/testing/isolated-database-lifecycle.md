# Isolated Database Lifecycle Testing

## Purpose and Safety Boundary

This project runs database lifecycle coverage only against a **disposable, explicitly labelled MySQL database**. The lifecycle suite never uses the application `DATABASE_URL` unless it exactly equals `TEST_DATABASE_URL`, both explicit safety markers are present, the database name contains `test`, `ci`, or `sandbox`, the account is not `root`, and the host does not look like a production endpoint. A failed check stops migrations and lifecycle operations before a connection is opened.

| Control                   | Required condition                                                                                      | Result when absent or invalid                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Dedicated endpoint        | `TEST_DATABASE_URL` is a MySQL-family URL                                                               | Lifecycle suite does not run                        |
| Explicit isolation marker | `TEST_DATABASE_ISOLATED=true`                                                                           | Lifecycle suite does not run                        |
| Lifecycle consent         | `TEST_DATABASE_LIFECYCLE=enabled`                                                                       | Migration wrapper and lifecycle suite refuse to run |
| Non-production identity   | Database name contains `test`, `ci`, or `sandbox`; account is not `root`; host has no production marker | URL is rejected before connection                   |
| Migration parity          | `DATABASE_URL` exactly equals `TEST_DATABASE_URL`                                                       | `db:test:migrate` terminates before Drizzle starts  |

## Local Execution

Provision a MySQL database dedicated to testing, such as `aldora_test`, with a non-root user limited to that database. Set the test endpoint and both markers through the project secret manager; do not commit connection strings. For a local lifecycle run, expose the same isolated endpoint as `DATABASE_URL` only for the command session, then run:

```bash
pnpm db:test:migrate
pnpm test:lifecycle
```

The suite applies the project migrations to the isolated database, creates only a transaction-scoped temporary probe table, asserts organization/branch/jurisdiction scoping, rolls the transaction back, drops the temporary table, and verifies that no permanent probe table remains.

## Continuous Integration

The continuous-integration workflow creates a fresh MySQL service container named `aldora_ci_test` for every run. It uses a non-root database user, runs the guarded migration wrapper, then executes the lifecycle suite serially. The container is destroyed with the workflow, so no application or production database is reachable through this job.

## Operational Notes

The application database and the test endpoint must remain separate. Test data must never be copied from production. The guard is a defence-in-depth control, not a substitute for network segmentation and least-privilege database credentials. If a self-hosted runner is introduced later, restrict it so the runner cannot route to production database networks.
