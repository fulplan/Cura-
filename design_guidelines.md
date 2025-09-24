# PWS Admin CMS Design Guidelines

## Design Approach
**System-Based Approach**: Using Fluent Design principles optimized for productivity and information-dense applications. This enterprise-focused CMS requires clear hierarchy, efficient workflows, and consistent patterns that support complex administrative tasks.

## Core Design Elements

### Color Palette
**Dark Mode Primary**:
- Background: 210 15% 8% (main background)
- Surface: 210 12% 12% (cards, panels)
- Border: 210 10% 20% (subtle dividers)
- Text Primary: 210 5% 95% (main content)
- Text Secondary: 210 5% 70% (labels, metadata)

**Light Mode Primary**:
- Background: 210 5% 98% (main background)
- Surface: 0 0% 100% (cards, panels)
- Border: 210 10% 90% (subtle dividers)
- Text Primary: 210 15% 15% (main content)
- Text Secondary: 210 10% 45% (labels, metadata)

**Brand Colors**:
- Primary: 210 85% 55% (actions, links)
- Success: 120 75% 45% (published status)
- Warning: 45 90% 55% (drafts, pending)
- Danger: 0 75% 55% (delete, errors)

### Typography
**Font System**: Inter via Google Fonts CDN
- Headlines: 600 weight, 1.2 line-height
- Body: 400 weight, 1.5 line-height  
- UI Labels: 500 weight, 1.4 line-height
- Code/Meta: 400 weight, monospace fallback

### Layout System
**Spacing Units**: Tailwind classes using 2, 4, 6, 8, 12, 16 units
- Micro spacing: p-2, gap-2
- Component spacing: p-4, m-6
- Section spacing: p-8, gap-12
- Major layout: p-16

### Component Library

**Navigation**:
- Fixed top bar (64px height) with search, notifications, profile
- Persistent left sidebar (280px width) with collapsible sections
- Breadcrumb navigation for deep content paths

**Data Display**:
- Card-based content blocks with subtle shadows
- Data tables with sortable headers and pagination
- Status badges with color-coded states (draft, published, scheduled)
- Progress indicators for upload/processing states

**Forms & Controls**:
- Floating label inputs with focus states
- Rich text editor with toolbar docking
- Drag-and-drop zones with visual feedback
- Modal overlays for focused tasks (editing, uploads)

**Dashboard Widgets**:
- Metric cards with trend indicators
- Recent activity lists with timestamps
- Quick action buttons with consistent iconography
- Calendar widget for scheduling overview

### Interaction Patterns

**Content Management**:
- Bulk selection with checkbox arrays
- Inline editing for quick updates
- Contextual menus (right-click) for power users
- Toast notifications for action feedback

**Layout Manager**:
- Visual drag-and-drop with snap guides
- Live preview panels
- Section templates with thumbnail previews
- Undo/redo functionality

### Visual Hierarchy
- Clear content zones with consistent padding
- Typography scale emphasizing scannable headings
- Strategic use of color for status and priority
- Generous whitespace for reduced cognitive load

### Responsive Behavior
- Sidebar collapses to icons on tablets
- Dashboard widgets stack vertically on mobile
- Tables become scrollable cards on small screens
- Touch-friendly controls (44px minimum target)

This design system prioritizes efficiency and clarity for content creators while maintaining visual polish that reflects the quality of the CMS platform.