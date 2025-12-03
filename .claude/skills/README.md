# Claude Skills for Commercial Newssite

This directory contains custom Claude skills for the commercial newssite project. Skills help Claude provide specialized assistance for specific tasks.

## Available Skills

### 1. Frontend/UX Skill (`frontend-ux/`)

Expert frontend/UX engineer for React/Next.js development using ShadCN components, Tailwind CSS v4, and proper SSR/CSR patterns.

**Use for:**
- Building or refactoring UI components
- Styling with Tailwind CSS v4 (orange theme)
- Working with ShadCN components
- React 19 and Next.js 16 development
- Writing component tests (Vitest + RTL)

**Features:**
- ✅ Always checks existing components first
- ✅ Manual ShadCN installation guidance (CLI has issues)
- ✅ Proper SSR/CSR patterns
- ✅ Testing requirements and examples
- ✅ Performance optimization guidelines
- ✅ Accessibility patterns
- ✅ Comprehensive reference examples

## Installation

To use these skills in your Claude Code environment:

### Option 1: Copy Skill to User Directory (Recommended)

```bash
# Copy the skill to your user skills directory
cp -r .claude/skills/frontend-ux ~/.claude/skills/

# Verify installation
ls ~/.claude/skills/frontend-ux/
```

### Option 2: Symlink (Advanced)

```bash
# Create symlink to keep skills updated with repository
ln -s "$(pwd)/.claude/skills/frontend-ux" ~/.claude/skills/frontend-ux
```

### Option 3: Manual Installation

1. Create the directory:
   ```bash
   mkdir -p ~/.claude/skills/frontend-ux
   ```

2. Copy the files:
   - Copy `.claude/skills/frontend-ux/SKILL.md` to `~/.claude/skills/frontend-ux/SKILL.md`
   - Copy `.claude/skills/frontend-ux/REFERENCE.md` to `~/.claude/skills/frontend-ux/REFERENCE.md`

## Verification

After installation, the skill should be automatically available. You can verify by:

1. Restarting Claude Code (if needed)
2. Asking Claude about frontend/UX tasks
3. The skill will automatically activate for React/Next.js component work

## Usage

Once installed, the skill will automatically activate when you:
- Work on React/Next.js components
- Style with Tailwind CSS
- Work with ShadCN components
- Refactor UI code
- Build user-facing features

You can also manually invoke it by mentioning frontend or UX tasks.

## Updating Skills

When skill files are updated in the repository:

```bash
# If you used Option 1 (copy), re-copy the skill
cp -r .claude/skills/frontend-ux ~/.claude/skills/

# If you used Option 2 (symlink), changes are automatic
```

## Creating New Skills

To add new skills to the project:

1. Create a new directory: `.claude/skills/your-skill-name/`
2. Add `SKILL.md` with skill definition (see `frontend-ux/SKILL.md` for template)
3. Optionally add `REFERENCE.md` with examples and references
4. Update this README with installation instructions
5. Commit and create a PR

### Skill File Structure

```
.claude/skills/your-skill-name/
├── SKILL.md         # Required: Main skill definition with frontmatter
├── REFERENCE.md     # Optional: Supplemental examples and patterns
└── helper-scripts/  # Optional: Executable scripts
```

### SKILL.md Format

```markdown
---
name: your-skill-name
description: Brief description of what the skill does and when to use it
---

# Skill Title

## Context

Background and purpose of the skill...

## Instructions

Detailed instructions for Claude to follow...

## Examples

Example patterns and use cases...
```

## Learn More

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Public Skills Repository](https://github.com/anthropics/skills)

## Contributing

When adding or updating skills:
1. Test the skill thoroughly
2. Update this README
3. Update `CLAUDE.md` if significant changes
4. Create a PR for review
