# Custom UI Component Library

This is a lightweight, custom component library built specifically for the Inventorly design system. All components are tightly integrated with your CSS design tokens in `/styles/globals.css`.

## Design System Integration

Every component uses CSS variables directly:
- **Colors**: `bg-primary`, `text-foreground`, `border-border`, etc.
- **Border Radius**: `rounded-[var(--radius)]`, `rounded-[var(--radius-sm)]`
- **Typography**: Inherits from semantic HTML elements (h1, h2, p, etc.)
- **Spacing**: Uses Tailwind's spacing scale
- **Shadows**: Uses `--elevation-sm` for elevated components

## Available Components

### Core Components
- **Button** - Primary, outline, ghost, and secondary variants
- **Card** - Container component with header, content, and footer sections
- **Input** - Form input with design system styling
- **Label** - Form labels
- **Badge** - Status indicators and tags
- **Separator** - Divider lines

### Interactive Components
- **Dialog** - Modal dialogs (uses Radix UI)
- **Popover** - Popup content (uses Radix UI)
- **Select** - Dropdown select menus (uses Radix UI)
- **Checkbox** - Checkboxes (uses Radix UI)
- **Switch** - Toggle switches (uses Radix UI)
- **Tabs** - Tabbed interfaces (uses Radix UI)

### Form Components
- **Input** - Text inputs
- **Textarea** - Multi-line text inputs
- **Calendar** - Date picker (uses react-day-picker)
- **InputOTP** - One-time password input

### Feedback Components
- **Alert** - Alert messages
- **Progress** - Progress bars
- **Skeleton** - Loading placeholders
- **Toaster** - Toast notifications (uses Sonner)

### Data Display
- **Table** - Data tables

## Usage Example

```tsx
import { Button } from "./components/ui-custom/button";
import { Card } from "./components/ui-custom/card";

function MyComponent() {
  return (
    <Card className="p-6">
      <h3>My Card</h3>
      <p className="text-muted-foreground">Card content</p>
      <Button variant="outline">Click Me</Button>
    </Card>
  );
}
```

## Customization

To update the entire app's styling, simply modify the CSS variables in `/styles/globals.css`:

```css
:root {
  --primary: rgba(35, 136, 255, 1); /* Change primary color */
  --radius: 12px; /* Change border radius globally */
  --text-base: 16px; /* Change base font size */
}
```

All components will automatically reflect these changes!

## Benefits

1. **Full Control** - You own every line of code
2. **Design System First** - Built around your CSS variables
3. **Lightweight** - Only what you need, no bloat
4. **Accessible** - Uses Radix UI primitives for complex components
5. **Easy Updates** - Change CSS variables to update the entire app
