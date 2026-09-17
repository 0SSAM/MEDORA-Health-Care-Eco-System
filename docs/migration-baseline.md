# Database Migration Baseline Reconciliation

The deployed database currently contains a `__drizzle_migrations` row for the hash of `0000_known_phantom_reporter.sql` only, while the repository contains migrations through `0017_exotic_prodigy.sql`. The deployed schema also contains later tables and columns, so the migration table is not a reliable complete history of the existing database state.

The repository must **not** run the ordinary historical migration chain against this database: doing so could replay table creation or older ALTER statements against already-existing objects. The repository must also not insert fabricated migration rows or modify the migration journal by hand without a controlled baseline procedure.

The safe next step is an explicitly reviewed baseline reconciliation migration or a fresh staging database comparison. That procedure must compare every table, column, nullability, index, enum, and constraint between the deployed schema and the Drizzle snapshots, record the existing-schema baseline hash, and then apply only forward migrations. The procedure should be executed first against a disposable staging database and approved by the database owner before touching production data.

Current verified facts: migration `0000` has hash `814a08e40d7fc2bcfd458759d18319198ca8ae394f2fa15617a78678e9c9c93b` in the deployed journal; migrations `0001` through `0017` exist in the repository; migration `0017` was applied as the non-destructive NOT NULL hardening for the eight regulated tables after the deployed tables were verified empty. This document intentionally leaves reconciliation open rather than claiming that the historical journal is synchronized.
