# Floating Assistant Redesign — Implementation Notes

The authenticated command centre already enforces organization, branch, and jurisdiction scope, including a valid jurisdiction identifier of `0`. The existing assistant is role-authorized but advisory-only, and the support-ticket path remains scoped through the existing typed procedures.

The redesign therefore reuses the current assistant workspace rather than creating a second chat or ticket flow. The floating entry point must be available only after authentication, must preserve Arabic RTL and English LTR placement, and must never send a question automatically. A launch prompt is prefilled as editable composer text so the user retains review and submission control.

The side-panel visual treatment is limited to transform/opacity transition semantics, retains keyboard escape closure, and leaves existing capture-risk auditing and tenant-scope logic untouched.
