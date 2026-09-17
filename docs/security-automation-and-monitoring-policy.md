# MEDORA Security Automation and Monitoring Policy

## Purpose

MEDORA performs automated quality and security checks after every push and pull request. The checks are designed to detect failures early while preserving human approval for changes that can affect patient data, organization isolation, permissions, regulated workflows, or production availability.

## Checks that run automatically

The CI workflow runs a TypeScript check, unit and contract tests, workflow and configuration formatting validation, a production build, and a non-mutating post-build smoke check. It also runs CodeQL analysis and dependency-review checks for pull requests. The production dependency audit is now a blocking gate at high severity; the previously identified high-severity production advisories were remediated and the resulting audit reports zero high or critical findings.

## Safe maintenance and repair boundary

Automatic maintenance may collect diagnostics, identify failing tests, produce a proposed patch, open a pull request, update non-sensitive development dependencies, and report the result. Automatic changes must not silently modify production data, database schemas, access roles, secret values, audit history, regulated transactions, prescriptions, invoices, tax records, government submissions, or tenant boundaries. Security-sensitive or regulated fixes require review and a successful CI run before merge.

The platform must fail closed when an update could weaken authorization, organization or jurisdiction isolation, encryption, audit integrity, or regulated workflow confirmation. A failed check creates an actionable report; it does not trigger an unrestricted self-modifying repair loop.

## Firewalls and infrastructure controls

Repository CI can validate application and dependency security, but it cannot prove the firewall state of a production host or cloud perimeter. Firewall and network controls must be verified through the hosting provider, infrastructure-as-code, vulnerability scanning, access logs, and an approved change process. MEDORA should report missing infrastructure evidence rather than claim that a firewall is configured.

## Cameras and microphones

Camera and microphone features are disabled by default and require explicit, informed consent, visible capture indicators, role-based access, retention limits, encryption, audit logging, jurisdictional review, and a documented purpose. Continuous workplace surveillance is not enabled implicitly by an application update. The system must not record or analyze staff, patients, or visitors without an approved policy and the necessary legal and organizational permissions. Where monitoring is approved, event metadata and alerts should be minimized; raw recordings should not be copied into ordinary application logs.

## Repository governance

The repository is private on a GitHub plan that returned a 403 when branch protection and repository rulesets were requested because GitHub requires an eligible plan or a public repository for this feature. The CI workflow, Dependabot configuration, and CODEOWNERS file are enabled as compensating controls. Once an eligible GitHub plan is available, require the quality and CodeQL checks, one approving review, conversation resolution, and disabled force-push/deletion on `main`.

## Operational response

A failed check should be triaged in this order: preserve the failing logs, identify whether the issue is code, dependency, configuration, infrastructure, or external integration, create a reviewed remediation change, rerun the full CI suite, and deploy only after the required approvals. Rollback should use a known checkpoint rather than destructive repository resets.

This policy describes engineering controls and boundaries. It is not a declaration of government acceptance, legal compliance, or completed penetration testing.
