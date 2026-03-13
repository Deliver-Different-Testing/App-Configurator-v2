# CLAUDE.md - Admin UI Project

## CRITICAL: MCP Tool Usage Rule

**NEVER call MCP tools directly. ALWAYS use agents.**

When you need to interact with the browser (Playwright MCP, Chrome DevTools MCP), you MUST use the Task tool with an appropriate subagent. This prevents large MCP responses (~12k+ tokens) from bloating the main conversation context.

### Correct Pattern:
```
Use Task tool with subagent_type to contain MCP responses:

Task tool with:
- subagent_type: "general-purpose"
- prompt: "Navigate to http://localhost:5173 and verify the Tasks menu item is visible and clickable."
```

### WRONG Pattern (DO NOT DO THIS):
```
Calling mcp__playwright__browser_navigate directly in main conversation
Calling mcp__chrome-devtools__take_snapshot directly in main conversation
```

### Why This Matters:
- MCP browser tools return large responses (screenshots, DOM snapshots, etc.)
- These responses consume significant context tokens
- Using agents isolates these responses from the main conversation
- The agent returns only a concise summary to the main thread

## Project Overview

This is a React + TypeScript + Vite admin UI for the Deliver Different platform settings menu.

### Tech Stack
- React 18 with TypeScript
- Vite for build/dev
- Tailwind CSS for styling
- @dnd-kit for drag-and-drop functionality
- Lucide React for icons

### Project Structure
```
src/
├── components/          # Shared UI components
│   ├── ui/             # Base UI (Button, Input, Toggle, Badge)
│   ├── data/           # Data display (ExpandableRow)
│   ├── filters/        # Filter components (SearchInput, FilterDropdown)
│   └── tags/           # Tag/connection components
├── modules/            # Feature modules
│   ├── territory/      # Territory module
│   ├── services/       # Services module
│   ├── tasks/          # Tasks module
│   └── ...
└── App.tsx             # Main app with routing
```

### Key Patterns

#### ExpandableRow Component
- Clicking the row header expands/collapses content
- Toggle components are ONLY for Active/Inactive status (not for expand/collapse)
- ConnectionBadge uses stopPropagation to avoid triggering row toggle

#### Module Structure
Each module follows this pattern:
```
modules/[name]/
├── [Name]Page.tsx      # Main page with tabs
├── components/         # Module-specific components
├── data/              # Sample/mock data
├── types.ts           # TypeScript interfaces
└── index.ts           # Exports
```

### Running the Project
```bash
npm install
npm run dev    # Starts at http://localhost:5173
```

### Implemented Modules

| Module | Menu Section | Features |
|--------|--------------|----------|
| Territory | Advanced | 3 tabs: Zip Zones, Zone Groups, Depots. Connection badges. |
| Clients | General | Client management with search/filters |
| Notifications | Advanced | Notification templates and settings |
| Tasks | Advanced | 2 tabs: Tasks, Task Groups. Drag-and-drop with @dnd-kit. |
| Automations | Advanced | "If this then that" rules. Conditions, Actions, Scope. |

### Key UI Patterns

#### ExpandableRow
- **Row click** = expand/collapse
- **Toggle** = ONLY for Active/Inactive status (never for expand)
- `ConnectionBadge` uses `stopPropagation()` to avoid row toggle

#### Automations Module (Latest)
- **Conditions** (7 types): job_unassigned, job_assigned, before/after/at_scheduled_time, status, scan
- **Actions** (6 types): update_job_status, create_task, complete_task, trigger_notification, send_sms, change_status
- **Scope**: Select customers and/or speeds (or "all")
