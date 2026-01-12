# Code Conventions

## File Structure

- Max **500 lines** per file (break up at 400 lines)
- Use folders and naming conventions to keep small files logically grouped

## Single Responsibility

- Every file, class, and function should do one thing only
- If it has multiple responsibilities, split immediately
- Each view, manager, or utility should be laser-focused on one concern

## Object-Oriented Design

- Every functionality should be in a dedicated class, even if small
- Favor composition over inheritance
- Code must be built for reuse, not just to "make it work"

## Modular Design

- Code should connect like Lego — interchangeable, testable, and isolated
- Ask: "Can I reuse this class in a different project?" If not, refactor
- Reduce tight coupling; favor dependency injection

## Naming Conventions

- Use ViewModel/Manager/Coordinator patterns:
  - UI logic → ViewModel
  - Business logic → Manager
  - Navigation/state flow → Coordinator
- All names must be descriptive and intention-revealing
- Avoid vague names: `data`, `info`, `helper`, `temp`

## Size Limits

- Functions: under 30-40 lines
- Classes: assess splitting if over 200 lines

## Avoid God Classes

- Never let one file or class hold everything
- Split into UI, State, Handlers, Networking, etc.

## Scalability

- Code as if someone else will scale this
- Include extension points (dependency injection, interfaces) from day one
