# PAN IIT Amaravati Summit 2026

## Ideas & Audience Engagement Platform --- Product Requirements Document (PRD)

**Version:** 1.0\
**Source baseline:** Functional Requirements V4 --- 28 September 2026\
**Event:** PAN IIT Amaravati Summit 2026\
**Event date:** 3 October 2026\
**Venue:** Dr. Ambedkar Kalavedika, Vijayawada\
**Expected attendance:** \~2,000\
**Product type:** Standalone, mobile-first web application\
**Language:** English only\
**Roles:** Attendee, Session Coordinator, Admin\
**Modules:** Ideas & Innovation; Live Session Engagement & Outcomes

------------------------------------------------------------------------

# 1. Product Overview

The Ideas & Audience Engagement Platform is a standalone web application
for PAN IIT Amaravati Summit 2026.

The product has two primary purposes:

1.  Allow every Summit attendee---not only panel members---to contribute
    ideas and participate in live sessions.
2.  Convert attendee contributions, session discussion notes, optional
    transcripts, feedback, and approved AI-generated summaries into
    structured Summit outcomes and same-day reports for the Chief
    Minister's Office (CMO), Government of Andhra Pradesh.

The platform is independent of the existing PANIIT Events Platform.
There is no shared login or required integration.

The application must be accessible through a browser using QR codes and
links. No native mobile application or installation is required.

------------------------------------------------------------------------

# 2. Product Goals

## 2.1 Attendee Goals

Attendees must be able to:

-   Sign in quickly.
-   Enter a session directly after scanning its QR code.
-   Submit ideas to the Summit.
-   Ask questions during live sessions.
-   Share ideas during live sessions.
-   Share opinions during live sessions.
-   View approved audience questions.
-   +1 an approved question once.
-   View and edit their own submissions where permitted.
-   Give session feedback.
-   Give overall Summit feedback.

The target experience for a logged-out attendee scanning a session QR
is:

**Scan QR → Authenticate → Enter Session → Submit First Input within 60
seconds.**

## 2.2 Coordinator Goals

Session Coordinators must be able to:

-   Manage an assigned session from a single operational workspace.
-   Monitor audience inputs in near real time.
-   Moderate inputs.
-   Make questions visible to the room.
-   Shortlist questions.
-   Mark inputs as discussed.
-   Hide inappropriate or irrelevant content.
-   Pause/resume/close participation.
-   Capture key discussion notes.
-   Generate an AI-assisted session outcome.
-   Edit the outcome.
-   Submit the outcome for Admin approval.

## 2.3 Admin Goals

Admins must be able to:

-   Configure the event without code changes.
-   Manage users and roles.
-   Manage themes and venues.
-   Configure sessions.
-   Generate session QR codes.
-   Moderate all content.
-   Manage ideas.
-   Merge duplicate ideas.
-   View live operational metrics.
-   Review session outcomes.
-   Generate AI-assisted theme summaries.
-   Generate Interim and Final reports.
-   Review and approve reports.
-   Export data.
-   Export reports as PDF and editable Word files.

------------------------------------------------------------------------

# 3. Scope

## 3.1 Module 1 --- Ideas & Innovation

Event-wide idea submission against Summit themes.

Capabilities:

-   Idea submission.
-   Idea editing/withdrawal.
-   Theme classification.
-   Session-sourced ideas.
-   Idea moderation.
-   Shortlisting.
-   Duplicate linking/merging.
-   Theme snapshots.
-   AI grouping and summarisation.
-   Theme-wise Ideas Summaries.

## 3.2 Module 2 --- Live Session Engagement & Outcomes

Audience engagement and outcome creation for individual sessions.

Capabilities:

-   Session QR entry.
-   Questions.
-   Session ideas.
-   Opinions.
-   +1 voting on visible questions.
-   Coordinator moderation.
-   Discussion notes.
-   Session feedback.
-   Summit feedback.
-   AI-assisted session outcomes.
-   Admin approval.
-   Consolidated reporting.

## 3.3 Unified Idea Pool

An idea submitted from within a live session must also enter the Module
1 idea pool.

Its source must identify the originating session.

------------------------------------------------------------------------

# 4. Out of Scope

The following are explicitly outside product scope:

-   Event registration.
-   Badges.
-   Check-in.
-   Travel.
-   Hotel.
-   Transport.
-   Meals.
-   Networking/social feed.
-   Certificates.
-   Gamification.
-   Leaderboards.
-   Live big-screen audience-question display.
-   Native mobile applications.
-   Integration with the existing Events Platform.

------------------------------------------------------------------------

# 5. Roles and Permissions

## 5.1 Attendee

Any Summit participant, including invited Round Table participants.

Permissions:

-   Authenticate.
-   Complete profile.
-   Accept consent.
-   Submit ideas.
-   Edit/withdraw own ideas while allowed.
-   Enter eligible sessions.
-   Ask questions.
-   Share session ideas.
-   Share opinions.
-   +1 visible questions.
-   Give feedback.
-   View own activity.

## 5.2 Session Coordinator

One AQV/PAN IIT volunteer or rapporteur assigned per applicable session.

The Coordinator is not the on-stage moderator.

Permissions:

-   View assigned sessions.
-   View submitter identity.
-   Monitor incoming inputs.
-   Moderate session inputs.
-   Make inputs visible.
-   Shortlist inputs.
-   Mark inputs discussed.
-   Hide inputs.
-   Pause/resume/close participation.
-   Capture discussion notes.
-   Generate/edit/submit session outcomes.

## 5.3 Admin

AQV/PAN IIT operations team.

Permissions:

-   Full event configuration.
-   Role assignment.
-   Coordinator assignment.
-   Session control.
-   Full moderation.
-   Outcome review/approval.
-   Dashboard access.
-   AI summary generation.
-   Report generation.
-   Report review.
-   Report approval where authorised.
-   Data export.

A user may hold more than one role.

Coordinator and Admin privileges are granted by Admin.

------------------------------------------------------------------------

# 6. UX Strategy

The product should not translate every functional requirement into a
separate page.

The recommended product architecture contains **18 primary screens**,
with secondary interactions implemented as:

-   Bottom sheets.
-   Modals.
-   Drawers.
-   Tabs.
-   Inline editing.
-   Contextual states.
-   Reusable forms.

## UX Principles

### Attendee

-   Mobile-first.
-   Minimum navigation.
-   Large touch targets.
-   Clear primary action.
-   Minimal typing.
-   No internal requirement terminology.
-   No technical IDs.
-   Session participation from one screen.
-   Fast feedback after actions.
-   Network-resilient submissions.

### Coordinator

-   Operational control-room design.
-   Near-real-time updates.
-   One-tap moderation.
-   Avoid navigation during live sessions.
-   High information clarity.
-   Tablet/laptop friendly.

### Admin

-   Desktop-first.
-   Operational rather than decorative dashboard.
-   Data tables with filtering.
-   Side drawers for details/editing.
-   Bulk operations.
-   Clear workflow statuses.
-   "Needs Attention" prioritisation.

------------------------------------------------------------------------

# 7. Information Architecture

## Common

1.  Login
2.  Profile Setup
3.  Consent & Privacy

## Attendee

4.  Home
5.  Live Session
6.  Share Idea
7.  My Activity
8.  Feedback

## Coordinator

9.  My Sessions
10. Session Control Room
11. Session Outcome

## Admin

12. Dashboard
13. Ideas
14. Sessions
15. Outcomes
16. Reports
17. People & Roles
18. Event Settings

------------------------------------------------------------------------

# 8. Common Screens

## 8.1 Login

### Purpose

Authenticate a user using enabled authentication methods.

### UI

-   Event branding.
-   Google Sign-In.
-   Email login-link option.
-   Mobile + OTP only when enabled.
-   Privacy/Terms link.

### Rules

-   Google is primary.
-   Email one-time link is an alternative.
-   Mobile OTP is configurable and OFF by default.
-   At least one login method must always remain active.
-   Session QR deep links must survive authentication.

### APIs

-   `GET /auth/config`
-   `POST /auth/google`
-   `POST /auth/email-link`
-   `POST /auth/otp/send`
-   `POST /auth/otp/verify`

------------------------------------------------------------------------

## 8.2 Profile Setup

### Fields

-   Name --- mandatory by default.
-   Organisation / Institution --- mandatory by default.
-   Designation --- configurable.
-   IIT --- configurable.
-   Batch --- configurable.
-   Mobile --- configurable.

Admin controls visibility and mandatory status.

### APIs

-   `GET /profile/config`
-   `GET /me`
-   `PATCH /me/profile`

------------------------------------------------------------------------

## 8.3 Consent & Privacy

First login must show a short consent notice covering:

-   Purpose of data use.
-   Data owner as confirmed by PAN IIT.
-   Privacy notice link.

Acceptance is required to continue.

### APIs

-   `GET /consent/current`
-   `POST /me/consent`

------------------------------------------------------------------------

# 9. Attendee Experience

## 9.1 Home

### Purpose

Give the attendee a simple event entry point.

### Components

-   Greeting.
-   Summit identity.
-   Primary "Share an Idea" CTA.
-   Happening Now session.
-   Upcoming sessions.
-   My Activity summary.
-   Bottom navigation.

### Recommended navigation

-   Home.
-   Sessions.
-   Activity.

### APIs

-   `GET /summit/public`
-   `GET /me/home`
-   `GET /sessions?scope=attendee`

------------------------------------------------------------------------

## 9.2 Live Session

### Header

-   Session title.
-   Session type.
-   Time.
-   Venue.
-   Speakers.
-   Status.

### Primary Actions

-   Ask a Question.
-   Share an Idea.
-   Share an Opinion.

Only enabled input types are shown.

### Audience Questions

Attendees can see only questions marked Visible to Room.

Each visible question displays:

-   Question text.
-   +1 count.
-   +1 action.

Submitter identity must never be shown to attendees.

No leaderboard is permitted.

### Session States

#### Upcoming

Show configured "Opens at hh:mm" message.

#### Live

Enable configured participation actions.

#### Paused

Show configured paused message and disable new input.

#### Closed

Disable new input and surface feedback.

### APIs

-   `GET /sessions/:id/public`
-   `GET /sessions/:id/participation`
-   `GET /sessions/:id/questions?visible=true`
-   `POST /sessions/:id/inputs`
-   `POST /session-inputs/:id/upvote`

### Interaction Pattern

Question/Idea/Opinion submission should open in bottom sheets rather
than separate pages where possible.

------------------------------------------------------------------------

## 9.3 Share Idea

### Fields

-   Title.
-   Theme.
-   Proposed Idea.
-   Problem / Opportunity.
-   Expected Impact.

Default configuration:

-   Title: mandatory, 100 characters.
-   Theme: mandatory.
-   Proposed Idea: mandatory.
-   Other text fields: up to 500 characters.

Actual labels, mandatory rules, and limits are configurable.

### Rules

-   Multiple ideas allowed while idea window is open.
-   Theme list includes active themes plus optional Other /
    Cross-cutting.
-   Ideas can originate from General or Session.
-   Own ideas can be edited/withdrawn until the idea window closes.

### APIs

-   `GET /ideas/config`
-   `GET /themes?active=true`
-   `POST /ideas`
-   `GET /ideas/:id`
-   `PATCH /ideas/:id`
-   `POST /ideas/:id/withdraw`

------------------------------------------------------------------------

## 9.4 My Activity

One consolidated screen for attendee submissions.

### Filters

-   All.
-   Ideas.
-   Questions.
-   Opinions.

### Item Information

-   Type.
-   Title/content preview.
-   Theme/session.
-   Submission time.
-   Status where appropriate.

### APIs

-   `GET /me/submissions`

------------------------------------------------------------------------

## 9.5 Feedback

### Session Feedback

Available after a session closes until the configured feedback-window
end.

Fields:

-   Rating --- mandatory.
-   Most valuable point --- optional.
-   Suggestion --- optional.

Target completion time: under 30 seconds.

### Summit Feedback

Opens at the configured time.

Fields:

-   Overall rating.
-   Best session.
-   Suggestion for next Summit.

### APIs

-   `GET /sessions/:id/feedback/config`
-   `POST /sessions/:id/feedback`
-   `GET /feedback/summit/config`
-   `POST /feedback/summit`

------------------------------------------------------------------------

# 10. Coordinator Experience

## 10.1 My Sessions

### Components

-   Assigned sessions.
-   Time.
-   Venue.
-   Session status.
-   Input counts.
-   Outcome status.
-   Open Control Room CTA.

### API

-   `GET /coordinator/sessions`

------------------------------------------------------------------------

## 10.2 Session Control Room

This is the Coordinator's primary live workspace.

### Header

-   Session title.
-   Venue/time.
-   Status.
-   Live/Pause/Close controls.

### Metrics

-   Participants.
-   Questions.
-   Ideas.
-   Opinions.

### Tabs

#### Live Inputs

Filters:

-   All.
-   Questions.
-   Ideas.
-   Opinions.

Sort:

-   Newest.
-   Most +1s.

Input card:

-   Type.
-   Content.
-   Submitter identity.
-   Timestamp.
-   +1 count.
-   Moderation flag.

Actions:

-   Visible to Room.
-   Shortlist.
-   Mark Discussed.
-   Hide.

#### Shortlist

Large, readable shortlisted inputs suitable for relaying to the on-stage
moderator.

#### Discussion Notes

Quick note entry without leaving the live workspace.

### Refresh

Incoming input list must refresh at least every 5 seconds.

WebSockets/SSE may be used for improved UX with polling fallback.

### Moderation

Profanity/blocked-word filtering must flag suspect content so it cannot
accidentally be made visible.

### APIs

-   `GET /sessions/:id/coordinator`
-   `GET /sessions/:id/inputs`
-   `PATCH /session-inputs/:id/visibility`
-   `PATCH /session-inputs/:id/shortlist`
-   `PATCH /session-inputs/:id/discussed`
-   `PATCH /session-inputs/:id/hide`
-   `PATCH /sessions/:id/status`
-   `GET /sessions/:id/notes`
-   `POST /sessions/:id/notes`
-   `PATCH /notes/:id`

------------------------------------------------------------------------

## 10.3 Session Outcome

Every Outcome Required session must have a Coordinator.

### Inputs

-   Coordinator notes.
-   Optional uploaded transcript/notes.
-   Eligible audience inputs.
-   Feedback statistics.

### Generate AI Draft

AI output sections:

1.  Session Summary.
2.  Key Discussion Themes.
3.  Key Audience Inputs.
4.  Ideas / Opportunities.
5.  Recommendations for GoAP.
6.  Action Points.
7.  Participation.

### Workflow

`Draft → Coordinator Submitted → Admin Finalised`

Coordinator can:

-   Generate.
-   Edit.
-   Save draft.
-   Submit.

Admin can:

-   Review.
-   Edit where permitted.
-   Approve/finalise.

Only Finalised outcomes enter reports.

### AI Failure

The same outcome template must support manual authoring.

Reporting must never depend solely on AI availability.

### APIs

-   `GET /sessions/:id/outcome`
-   `POST /sessions/:id/outcome/generate`
-   `PATCH /sessions/:id/outcome`
-   `POST /sessions/:id/outcome/submit`
-   `POST /admin/outcomes/:id/approve`

------------------------------------------------------------------------

# 11. Admin Experience

## 11.1 Dashboard

### Purpose

Show event health and items requiring operational attention.

### Metrics

-   Users logged in.
-   Ideas by theme.
-   Inputs per session/type.
-   Feedback count.
-   Average rating.

### Charts

-   Ideas by theme.
-   Participation by session.
-   Outcome status.

### Needs Attention

Examples:

-   Outcome waiting for approval.
-   Flagged session inputs.
-   Session without assigned Coordinator.
-   Pending theme summary.
-   Report requiring review.

### Session Progress

Show each session and outcome state.

### APIs

-   `GET /admin/dashboard`
-   `GET /admin/dashboard/charts`

------------------------------------------------------------------------

## 11.2 Ideas

### Table

Columns may include:

-   Title.
-   Theme.
-   Source.
-   Organisation.
-   Status.
-   Date.

### Filters

-   Search.
-   Theme.
-   Source.
-   Organisation.
-   Status.
-   Date.

### Status

-   New.
-   Shortlisted.
-   Hidden.

Hidden content:

-   Remains stored.
-   Is excluded from AI.
-   Is excluded from reports.

### Details

Open in a side drawer rather than a separate page.

### Actions

-   Shortlist.
-   Hide.
-   Link/merge duplicate.
-   View submitter.
-   View source.

### Theme Snapshot

Printable one-page view of shortlisted ideas/inputs per theme.

### AI Insights

AI may:

-   Group ideas into sub-themes.
-   Flag likely duplicates.
-   Highlight notable ideas.

All AI output remains Draft until Admin approval.

### APIs

-   `GET /admin/ideas`
-   `GET /admin/ideas/:id`
-   `PATCH /admin/ideas/:id/status`
-   `POST /admin/ideas/merge`
-   `GET /admin/themes/:id/snapshot`
-   `POST /admin/themes/:id/analyse`
-   `POST /admin/themes/:id/summary/generate`
-   `PATCH /admin/theme-summaries/:id`
-   `POST /admin/theme-summaries/:id/approve`

------------------------------------------------------------------------

## 11.3 Sessions

### List

Display:

-   Session number.
-   Title.
-   Theme.
-   Time.
-   Venue.
-   Coordinator.
-   Status.
-   Participation.
-   Outcome status.

### Create/Edit Session

Fields:

-   Type.
-   Title.
-   Theme.
-   Date.
-   Start time.
-   End time.
-   Venue.
-   Speakers.
-   Coordinator.
-   Participation Y/N.
-   Feedback Y/N.
-   Outcome Required Y/N.
-   Access: Open / Invited Only.
-   Active/inactive.

### Input Configuration

Per session:

-   Question enabled.
-   Idea enabled.
-   Opinion enabled.

### Status

-   Upcoming.
-   Live.
-   Paused.
-   Closed.

### QR

Each participation-enabled session gets:

-   Unique QR.
-   Short URL.
-   Downloadable QR image.

### Bulk Import

Sessions can be uploaded from Excel.

### APIs

-   `GET /admin/sessions`
-   `POST /admin/sessions`
-   `GET /admin/sessions/:id`
-   `PATCH /admin/sessions/:id`
-   `GET /admin/sessions/:id/details`
-   `GET /admin/sessions/:id/qr`
-   `POST /admin/sessions/import`

------------------------------------------------------------------------

## 11.4 Outcomes

### Purpose

Central review queue for session outcomes.

### Table

-   Session.
-   Coordinator.
-   Session end time.
-   Outcome status.
-   Last updated.
-   Action.

### States

-   Waiting.
-   Draft.
-   Submitted.
-   Finalised.

### Detail

Open editor/reviewer without leaving the workflow.

### Timing Goal

Each session outcome should be drafted, submitted, and approved within
30 minutes of session closing.

------------------------------------------------------------------------

## 11.5 Reports

### Report Types

-   Theme-wise Ideas Summary.
-   Session Outcome Report.
-   Consolidated Summit Outcomes Report.

### Rules

Reports use approved content only.

### Generation

Admin can:

-   Generate reports throughout 3 October.
-   Regenerate as new approved content becomes available.
-   Generate "as of now."
-   Mark report Interim or Final.

The cover must show generation timestamp.

Earlier versions must be retained.

### Status

`Draft → Reviewed → Approved`

Only authorised Admins can approve reports.

Nothing is automatically sent or published.

### Exports

-   PDF.
-   Editable Word.

### APIs

-   `GET /admin/reports`
-   `POST /admin/reports/generate`
-   `GET /admin/reports/:id`
-   `PATCH /admin/reports/:id`
-   `POST /admin/reports/:id/review`
-   `POST /admin/reports/:id/approve`
-   `GET /admin/reports/:id/versions`
-   `GET /admin/reports/:id/export?format=pdf`
-   `GET /admin/reports/:id/export?format=docx`

------------------------------------------------------------------------

## 11.6 People & Roles

### User Table

-   Name.
-   Email.
-   Organisation.
-   Roles.
-   Status.

### Role Types

-   Attendee.
-   Coordinator.
-   Admin.

### Round Table Invitees

Invited-only Round Table access is controlled by email list.

Round Table inputs and notes are visible only to Coordinator/Admin and
appear in reports only after explicit Admin approval.

### Bulk Upload

Support Excel upload for:

-   Admin list.
-   Coordinator list.
-   Round Table invitees.

### APIs

-   `GET /admin/users`
-   `GET /admin/users/:id`
-   `PATCH /admin/users/:id/roles`
-   `POST /admin/users/import`
-   `GET /admin/invitees`
-   `POST /admin/invitees/import`

------------------------------------------------------------------------

## 11.7 Event Settings

One settings workspace with tabs.

All event-specific configuration must be changeable without code
deployment.

### General

-   Summit name.
-   Theme line.
-   Dates.
-   Venue.
-   Time zone.

### Branding

-   Logos.
-   Colours.
-   Login banner.
-   Report cover.

### Access

-   Google login ON/OFF.
-   Email link ON/OFF.
-   Mobile OTP ON/OFF.
-   Profile fields.
-   Consent/privacy text.

At least one authentication method must remain active.

### Themes

-   Add.
-   Edit.
-   Reorder.
-   Activate/deactivate.
-   Other / Cross-cutting ON/OFF.

### Venues

-   Add/edit rooms/venues.

### Sessions

-   Session configuration defaults.
-   Manual/automatic Live behavior.
-   Coordinator assignment.

### Ideas

-   Submission ON/OFF.
-   Window open/close.
-   Field labels.
-   Mandatory flags.
-   Character limits.

### Participation

-   Question ON/OFF.
-   Idea ON/OFF.
-   Opinion ON/OFF.
-   Input length.
-   Coordinator approval requirement.
-   +1 ON/OFF.

### Moderation

-   Profanity filter ON/OFF.
-   Editable blocked-word list.

### Feedback

-   Rating scale.
-   Session feedback questions.
-   Feedback close time.
-   Summit feedback ON/OFF.
-   Summit feedback opening time.

### Messages

Configurable attendee messages:

-   Opens at.
-   Paused.
-   Closed.
-   Thank you.

### AI

-   AI ON/OFF.
-   Session Outcome prompt.
-   Theme Summary prompt.
-   Consolidated Report prompt.
-   Version history.

AI auto-publish is always OFF.

### Reports

-   Cover.
-   Logos.
-   Addressee.
-   Sections.
-   Footer.
-   Authorised approvers.

### APIs

-   `GET/PATCH /admin/config/summit`
-   `GET/PATCH /admin/config/branding`
-   `GET/PATCH /admin/config/auth`
-   `GET/PATCH /admin/config/profile`
-   `GET/PATCH /admin/config/consent`
-   `GET/PATCH /admin/config/ideas`
-   `GET/PATCH /admin/config/participation`
-   `GET/PATCH /admin/config/moderation`
-   `GET/PATCH /admin/config/feedback`
-   `GET/PATCH /admin/config/messages`
-   `GET/PATCH /admin/config/ai`
-   `GET/PATCH /admin/config/reports`

------------------------------------------------------------------------

# 12. Data Models

## 12.1 User

``` ts
interface User {
  id: string;
  name: string;
  email: string;
  organisation: string;
  designation?: string;
  iit?: string;
  batch?: string;
  mobile?: string;
  roles: ("ATTENDEE" | "COORDINATOR" | "ADMIN")[];
  consentAccepted: boolean;
  consentVersion?: string;
  createdAt: string;
  lastLoginAt?: string;
}
```

## 12.2 Theme

``` ts
interface Theme {
  id: string;
  name: string;
  order: number;
  active: boolean;
  isOtherCrossCutting: boolean;
}
```

## 12.3 Venue

``` ts
interface Venue {
  id: string;
  name: string;
  active: boolean;
}
```

## 12.4 Session

``` ts
interface Session {
  id: string;
  type: string;
  title: string;
  themeId?: string;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  speakers: string[];
  coordinatorId?: string;

  participationEnabled: boolean;
  feedbackEnabled: boolean;
  outcomeRequired: boolean;

  accessType: "OPEN" | "INVITED_ONLY";

  inputTypes: {
    questionEnabled: boolean;
    ideaEnabled: boolean;
    opinionEnabled: boolean;
  };

  status: "UPCOMING" | "LIVE" | "PAUSED" | "CLOSED";
  active: boolean;

  shortUrl?: string;
  qrCodeUrl?: string;
}
```

## 12.5 Idea

``` ts
interface Idea {
  id: string;
  title: string;
  themeId: string;
  proposedIdea: string;
  problemOpportunity?: string;
  expectedImpact?: string;

  sourceType: "GENERAL" | "SESSION";
  sourceSessionId?: string;

  submitterId: string;
  organisation?: string;

  status: "NEW" | "SHORTLISTED" | "HIDDEN" | "WITHDRAWN";

  createdAt: string;
  updatedAt: string;
}
```

## 12.6 Session Input

``` ts
interface SessionInput {
  id: string;
  sessionId: string;
  submitterId: string;

  type: "QUESTION" | "IDEA" | "OPINION";
  content: string;

  visibleToRoom: boolean;
  shortlisted: boolean;
  discussed: boolean;
  hidden: boolean;

  moderationFlag?: boolean;
  upvoteCount: number;

  createdAt: string;
}
```

## 12.7 Session Feedback

``` ts
interface SessionFeedback {
  id: string;
  sessionId: string;
  userId: string;
  rating: number;
  mostValuablePoint?: string;
  suggestion?: string;
  createdAt: string;
}
```

## 12.8 Coordinator Note

``` ts
interface CoordinatorNote {
  id: string;
  sessionId: string;
  coordinatorId: string;
  speaker?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

## 12.9 Session Outcome

``` ts
interface SessionOutcome {
  id: string;
  sessionId: string;

  sessionSummary: string;
  discussionThemes: string[];
  audienceInputs: string[];
  ideasOpportunities: string[];
  recommendations: string[];
  actionPoints: string[];
  participationStats: Record<string, number>;

  generatedByAI: boolean;
  promptVersion?: string;

  status: "DRAFT" | "SUBMITTED" | "FINALISED";

  coordinatorId: string;
  approvedBy?: string;
  approvedAt?: string;
}
```

## 12.10 Report

``` ts
interface Report {
  id: string;

  type:
    | "THEME_IDEAS"
    | "SESSION_OUTCOME"
    | "CONSOLIDATED_SUMMIT";

  reportMode: "INTERIM" | "FINAL";

  generatedAsOf: string;
  content: unknown;

  includedSessions: string[];
  includedThemes: string[];

  status: "DRAFT" | "REVIEWED" | "APPROVED";
  version: number;

  generatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;

  generatedAt: string;
  approvedAt?: string;
}
```

------------------------------------------------------------------------

# 13. Backend Architecture

Recommended domain modules:

1.  Authentication Service.
2.  User & Role Service.
3.  Configuration Service.
4.  Theme Service.
5.  Venue Service.
6.  Session Service.
7.  Idea Service.
8.  Participation Service.
9.  Moderation Service.
10. Feedback Service.
11. Coordinator Notes Service.
12. Outcome Service.
13. AI Service.
14. Reporting Service.
15. Export Service.
16. QR/Short URL Service.
17. Dashboard/Aggregation Service.
18. File/Asset Service.

------------------------------------------------------------------------

# 14. API Requirements

## Authentication

-   `GET /auth/config`
-   `POST /auth/google`
-   `POST /auth/email-link`
-   `POST /auth/otp/send`
-   `POST /auth/otp/verify`

## Current User

-   `GET /me`
-   `PATCH /me/profile`
-   `POST /me/consent`
-   `GET /me/home`
-   `GET /me/submissions`
-   `GET /me/ideas`

## Ideas

-   `GET /ideas/config`
-   `POST /ideas`
-   `GET /ideas/:id`
-   `PATCH /ideas/:id`
-   `POST /ideas/:id/withdraw`

## Sessions

-   `GET /sessions`
-   `GET /sessions/:id/public`
-   `GET /sessions/:id/participation`
-   `POST /sessions/:id/inputs`
-   `GET /sessions/:id/questions`
-   `POST /session-inputs/:id/upvote`

## Feedback

-   `GET /sessions/:id/feedback/config`
-   `POST /sessions/:id/feedback`
-   `GET /feedback/summit/config`
-   `POST /feedback/summit`

## Coordinator

-   `GET /coordinator/sessions`
-   `GET /sessions/:id/coordinator`
-   `GET /sessions/:id/inputs`
-   `PATCH /session-inputs/:id/visibility`
-   `PATCH /session-inputs/:id/shortlist`
-   `PATCH /session-inputs/:id/discussed`
-   `PATCH /session-inputs/:id/hide`
-   `PATCH /sessions/:id/status`
-   `GET /sessions/:id/notes`
-   `POST /sessions/:id/notes`
-   `PATCH /notes/:id`
-   `GET /sessions/:id/outcome`
-   `POST /sessions/:id/outcome/generate`
-   `PATCH /sessions/:id/outcome`
-   `POST /sessions/:id/outcome/submit`

## Admin --- Ideas

-   `GET /admin/ideas`
-   `GET /admin/ideas/:id`
-   `PATCH /admin/ideas/:id/status`
-   `POST /admin/ideas/merge`
-   `GET /admin/themes/:id/snapshot`
-   `POST /admin/themes/:id/analyse`
-   `POST /admin/themes/:id/summary/generate`
-   `PATCH /admin/theme-summaries/:id`
-   `POST /admin/theme-summaries/:id/approve`

## Admin --- Sessions

-   `GET /admin/sessions`
-   `POST /admin/sessions`
-   `GET /admin/sessions/:id`
-   `PATCH /admin/sessions/:id`
-   `GET /admin/sessions/:id/details`
-   `GET /admin/sessions/:id/qr`
-   `POST /admin/sessions/import`

## Admin --- Users

-   `GET /admin/users`
-   `GET /admin/users/:id`
-   `PATCH /admin/users/:id/roles`
-   `POST /admin/users/import`
-   `GET /admin/invitees`
-   `POST /admin/invitees/import`

## Admin --- Outcomes

-   `GET /admin/outcomes`
-   `GET /admin/outcomes/:id`
-   `POST /admin/outcomes/:id/approve`

## Admin --- Reports

-   `GET /admin/reports`
-   `POST /admin/reports/generate`
-   `GET /admin/reports/:id`
-   `PATCH /admin/reports/:id`
-   `POST /admin/reports/:id/review`
-   `POST /admin/reports/:id/approve`
-   `GET /admin/reports/:id/versions`
-   `GET /admin/reports/:id/export?format=pdf`
-   `GET /admin/reports/:id/export?format=docx`

## Exports

-   `GET /admin/exports/ideas.xlsx`
-   `GET /admin/exports/session-inputs.xlsx`
-   `GET /admin/exports/notes.xlsx`
-   `GET /admin/exports/feedback.xlsx`
-   `GET /admin/exports/all.xlsx`

## File Uploads

-   `POST /admin/sessions/:id/transcript`
-   `POST /admin/sessions/:id/notes-file`
-   `POST /admin/assets/logo`
-   `POST /admin/assets/login-banner`
-   `POST /admin/assets/report-cover`

------------------------------------------------------------------------

# 15. AI Requirements

## 15.1 General Rules

-   AI can be enabled/disabled.
-   Prompt templates are editable and versioned.
-   AI output is never auto-published.
-   AI output begins as Draft.
-   Admin approval is required before approved content enters reports.
-   Hidden inputs must never be sent to AI.
-   Attendee names, email addresses, and mobile numbers must never be
    sent to AI.

## 15.2 Session Outcome AI

Inputs:

-   Coordinator notes.
-   Optional transcript.
-   Eligible audience inputs.
-   Feedback statistics.

Output maximum: 600 words.

Required sections:

1.  Session Summary.
2.  Key Discussion Themes.
3.  Key Audience Inputs.
4.  Ideas & Opportunities.
5.  Recommendations for GoAP.
6.  Action Points.
7.  Participation.

The system must not invent facts, names, figures, or commitments.

## 15.3 Theme-wise Ideas AI

Input:

-   Eligible ideas for a theme.

Capabilities:

-   Group into up to five sub-themes.
-   Count ideas per sub-theme.
-   Highlight up to three notable ideas.
-   Produce recommended next steps.

Maximum output: 400 words.

## 15.4 Consolidated Report AI

Inputs:

-   Approved session outcomes.
-   Approved theme summaries.
-   Participation statistics.

Maximum output: 1,200 words.

Required sections:

1.  Executive Summary.
2.  Participation at a Glance.
3.  Cross-cutting Themes.
4.  Theme-wise Highlights.
5.  Priority Recommendations for GoAP.
6.  Next Steps & Follow-up.

For Interim reports, included and pending sessions must be clear.

------------------------------------------------------------------------

# 16. Non-Functional Requirements

## 16.1 Mobile Performance

The attendee application must:

-   Be mobile-first.
-   Be lightweight.
-   Work on low-end smartphones.
-   Remain usable on congested venue mobile networks.

## 16.2 Scale

Support approximately 2,000 users.

The system must handle bursts of several hundred submissions within
minutes after a QR code is displayed.

## 16.3 Reliable Submission

No lost or duplicate submissions.

On weak connectivity:

1.  Keep the input locally.
2.  Retry submission.
3.  Use an idempotency mechanism to prevent duplicate saves.
4.  Show "Submitted" only after server confirmation.

Recommended request header:

``` http
Idempotency-Key: <client-generated-uuid>
```

## 16.4 Hosting & Security

-   Hosted in India.
-   HTTPS.
-   Role-based access control.
-   Full data export on request.
-   Data ownership/controller as confirmed by PAN IIT.

## 16.5 AI Performance

Targets:

-   Session draft: ≤ 2 minutes.
-   Consolidated report draft: ≤ 5 minutes.

## 16.6 Privacy

Never send to AI:

-   Attendee names.
-   Email addresses.
-   Mobile numbers.
-   Hidden inputs.

## 16.7 Testing

A load test and full dry run must occur on 2 October 2026.

The dry run must include an end-to-end report generation flow.

------------------------------------------------------------------------

# 17. Important UI States

These are not separate routes but must be designed.

1.  Loading.
2.  Empty.
3.  Offline.
4.  Weak connection.
5.  Submission queued.
6.  Submission retrying.
7.  Submission confirmed.
8.  Submission failed.
9.  Session upcoming.
10. Session live.
11. Session paused.
12. Session closed.
13. Idea window closed.
14. Feedback closed.
15. Access denied.
16. Invited-only access.
17. Profanity/moderation flagged.
18. AI generating.
19. AI generation failed.
20. Manual outcome fallback.
21. Report generating.
22. Report Draft.
23. Report Reviewed.
24. Report Approved.
25. No search results.
26. Import validation errors.
27. Import success.
28. QR generation error.

------------------------------------------------------------------------

# 18. Initial Summit Configuration

## Themes

1.  Energy in the Age of AI.
2.  Deep Tech in All Walks of Life; Product Perfection.
3.  Space, Aerospace & Defence Manufacturing.
4.  BioValley -- Health Access & Screening at Scale.
5.  Agri Tech -- Farmers & Water Security.
6.  AI in Governance.
7.  Skilling & Entrepreneurship.
8.  Amaravati Capital City.
9.  Other / Cross-cutting.

Themes remain configurable.

## Venues

-   Main Hall.
-   First Floor RT Room 1.
-   First Floor RT Room 2.
-   First Floor RT Room 3.

------------------------------------------------------------------------

# 19. Initial Sessions

  -------------------------------------------------------------------------------------
  ID          Time           Session            Participation   Feedback    Outcome
  ----------- -------------- ------------------ --------------- ----------- -----------
  S1          09:05--09:55   Panel 1 --- Energy Open            Yes         Yes
                             in the Age of AI                               

  S2          11:15--12:05   Panel 2 --- Deep   Open            Yes         Yes
                             Tech in All Walks                              
                             of Life                                        

  S3          12:10--13:00   Panel 3 --- Space, Open            Yes         Yes
                             Aerospace &                                    
                             Defence Mfg.                                   

  S4          13:50--14:40   Panel 4 ---        Open            Yes         Yes
                             BioValley                                      

  S5          14:45--15:35   Panel 5 --- Agri   Open            Yes         Yes
                             Tech                                           

  S6          15:40--16:10   Talk 1 ---         Open            Yes         Yes
                             Skilling &                                     
                             Entrepreneurship                               

  S7          16:10--16:40   Talk 2 --- AI in   Open            Yes         Yes
                             Governance                                     

  S8          16:40--17:00   Talk 3 ---         Open            Yes         Yes
                             Amaravati Capital                              
                             City                                           

  S9          14:00--15:30   RT 1 --- IIT       Invited Only    No          Yes
                             Directors'                                     
                             Conclave                                       

  S10         14:15--15:45   RT 2 --- VCs &     Invited Only    No          Yes
                             Family Offices                                 

  S11         14:30--16:00   RT 3 --- Industry  Invited Only    No          Yes
                             Leaders & Unicorn                              
                             CXOs                                           
  -------------------------------------------------------------------------------------

Not initially configured as participation/outcome sessions:

-   Inaugural.
-   Policy Paper Presentations.
-   Valedictory.

They may be added/configured later if required.

------------------------------------------------------------------------

# 20. Same-Day Reporting Workflow

The product must support the following operational timeline on 3
October.

## During the Day

Each session outcome should be drafted, submitted, and approved within
30 minutes after the session closes.

## 04:05 PM

Theme snapshot available for Policy Paper Lead Speakers.

Interim reports may be generated at any point.

## 05:00 PM

Last configured session ends.

Idea window closes.

## 05:00--05:30 PM

-   Last session outcomes approved.
-   Theme-wise Ideas Summaries generated.
-   Theme summaries approved.

## 05:30--06:00 PM

Generate Final Consolidated Summit Outcomes Report "as of now."

Admin reviews report.

## 06:00--06:15 PM

Authorised Admin marks report Final and approves it.

## By 06:30 PM

Export:

-   PDF.
-   Editable Word.

Submission to CMO occurs operationally outside automatic publishing.

------------------------------------------------------------------------

# 21. Recommended Frontend Route Structure

``` text
/login
/profile/setup
/consent

/app
/app/home
/app/ideas/new
/app/activity
/app/sessions/:id
/app/feedback

/coordinator
/coordinator/sessions
/coordinator/sessions/:id
/coordinator/sessions/:id/outcome

/admin
/admin/dashboard
/admin/ideas
/admin/sessions
/admin/outcomes
/admin/reports
/admin/people
/admin/settings
```

Secondary functionality should use drawers/modals/tabs rather than
unnecessary routes.

------------------------------------------------------------------------

# 22. Reusable UI Components

## General

-   AppShell.
-   PageHeader.
-   StatusBadge.
-   EmptyState.
-   ErrorState.
-   LoadingState.
-   Toast.
-   ConfirmationDialog.
-   SearchInput.
-   FilterBar.
-   FileUploader.

## Attendee

-   SessionCard.
-   IdeaCard.
-   ActivityCard.
-   SessionStatusBanner.
-   ParticipationAction.
-   SubmissionBottomSheet.
-   QuestionCard.
-   FeedbackForm.
-   StarRating.
-   OfflineSubmissionIndicator.

## Coordinator

-   SessionMetrics.
-   InputFeed.
-   ModerationInputCard.
-   ModerationActions.
-   ShortlistPanel.
-   NotesPanel.
-   SessionStatusControl.
-   OutcomeEditor.

## Admin

-   AdminSidebar.
-   KPIGrid.
-   NeedsAttentionPanel.
-   DataTable.
-   DetailDrawer.
-   FilterDrawer.
-   BulkImportDialog.
-   QRDialog.
-   ReportEditor.
-   ApprovalTimeline.
-   VersionHistory.
-   SettingsTabs.

------------------------------------------------------------------------

# 23. Accessibility Requirements

The product should target WCAG 2.1 AA-level usability where practical.

Requirements:

-   Keyboard-accessible Admin/Coordinator controls.
-   Visible focus states.
-   Semantic labels.
-   Sufficient colour contrast.
-   Status must not rely on colour alone.
-   Minimum comfortable mobile touch targets.
-   Form validation must include textual error messages.
-   Screen-reader-friendly form labels.
-   Loading/status announcements for important asynchronous actions.

------------------------------------------------------------------------

# 24. Analytics & Operational Logging

Recommended product events:

-   Login started.
-   Login completed.
-   QR session opened.
-   Session joined.
-   Question submitted.
-   Idea submitted.
-   Opinion submitted.
-   Question +1.
-   Feedback submitted.
-   Input moderated.
-   Session paused.
-   Session resumed.
-   Session closed.
-   Outcome generated.
-   Outcome submitted.
-   Outcome approved.
-   Theme summary generated.
-   Report generated.
-   Report reviewed.
-   Report approved.
-   Export downloaded.

Operational logs should record privileged Admin/Coordinator actions for
traceability.

------------------------------------------------------------------------

# 25. Error Handling

## Attendee

Errors must use plain language.

Examples:

-   "We couldn't send this yet. We'll keep trying."
-   "Participation is temporarily paused."
-   "This session has ended."
-   "The idea submission window has closed."

Never discard typed content because of a network error.

## Coordinator/Admin

Show:

-   Clear error reason.
-   Retry where safe.
-   Last successful save time for long-form notes/outcomes.
-   Unsaved changes warning.
-   Import row-level validation errors.

------------------------------------------------------------------------

# 26. Security Requirements

-   Server-side role enforcement.
-   Session access enforcement.
-   Invited-only Round Table enforcement.
-   HTTPS only.
-   Secure authentication tokens/cookies.
-   CSRF protection where applicable.
-   Rate limiting.
-   Input validation.
-   Output encoding.
-   File upload validation.
-   Audit logs for privileged actions.
-   Authorised-Admin enforcement for report approval.
-   Never trust frontend role checks as authorization.

------------------------------------------------------------------------

# 27. DP1 --- Mandatory Build-First Scope

DP1 includes:

-   Authentication.
-   Profile.
-   Consent.
-   Ideas submission.
-   My submissions.
-   Idea moderation.
-   Theme snapshot.
-   Session participation.
-   Visible questions.
-   +1.
-   Coordinator live moderation.
-   Session status control.
-   Profanity filter.
-   Round Table access.
-   Session feedback.
-   Summit feedback.
-   Coordinator notes.
-   Core configuration.
-   Dashboard live counts.
-   Excel exports.
-   Reliability/network handling.
-   Security/hosting.
-   Load test/dry run readiness.

------------------------------------------------------------------------

# 28. DP2 --- Mandatory Follow-On Scope

DP2 includes:

-   Duplicate idea linking/merging.
-   AI idea grouping.
-   Theme-wise Ideas Summaries.
-   Transcript/notes upload.
-   AI session outcomes.
-   Outcome workflow/finalisation.
-   Dashboard charts.
-   Report generation.
-   Interim/Final report support.
-   Report versioning.
-   Report approval.
-   PDF/Word exports.
-   AI performance/privacy requirements.

DP1 and DP2 are both mandatory for the event.

------------------------------------------------------------------------

# 29. Acceptance Criteria Summary

The product is event-ready when:

-   Attendees can authenticate using configured methods.
-   QR deep links return attendees to the intended session.
-   Attendees can submit ideas.
-   Live sessions accept configured input types only while Live.
-   Paused sessions stop new submissions.
-   Closed sessions direct users to feedback.
-   Attendee identities are hidden from other attendees.
-   +1 is limited to one per attendee/question.
-   Coordinator input feed updates within the required interval.
-   Moderation actions work without page reload dependency.
-   Hidden inputs never enter AI/report processing.
-   Session notes can be captured reliably.
-   Outcomes can be generated with AI or written manually.
-   Outcomes require approval before reporting.
-   Theme summaries require approval.
-   Admin can configure the event without deployment.
-   Excel exports are available.
-   Reports can be generated repeatedly "as of now."
-   Report versions are retained.
-   Reports support Draft → Reviewed → Approved.
-   Authorised Admin approval is enforced.
-   PDF and editable Word exports work.
-   Weak-network submissions are safely retried without duplicates.
-   Approximately 2,000 users and burst submission traffic are
    supported.
-   AI never receives attendee names, emails, mobiles, or hidden inputs.
-   Full dry run and end-to-end reporting can be completed before event
    day.

------------------------------------------------------------------------

# 30. Product Success Definition

The product succeeds when an attendee can participate without training,
a Coordinator can operate a live session without switching between
multiple tools, and the Admin team can transform approved Summit
participation and session discussion into a reviewed, exportable final
outcomes report within the event-day reporting timeline.

The core UX principle is:

> **Keep attendee participation effortless, Coordinator operations
> immediate, and Admin workflows controlled and traceable.**
