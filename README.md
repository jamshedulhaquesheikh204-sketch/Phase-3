# Todo CLI App - Phase 1

A simple, beginner-friendly command-line todo application built with Python. This Phase 1 implementation features in-memory task storage with full CRUD operations (Create, Read, Update, Delete).

## Features

This application implements all Phase 1 functional requirements (FR-001 through FR-018):

- **Add Tasks**: Create new tasks with title (required) and description (optional)
- **List Tasks**: View all tasks with ID, title, description, and completion status
- **Update Tasks**: Modify task title and/or description by ID
- **Mark Complete/Incomplete**: Toggle task completion status
- **Delete Tasks**: Remove tasks by ID
- **Interactive Menu**: Menu-driven CLI with numbered options (1-6)
- **Input Validation**: Graceful error handling for all invalid inputs
- **User-Friendly Messages**: Clear feedback for every operation

## Requirements

- **Python 3.13+** (no external dependencies)
- Terminal/Command Prompt
- No installation required (uses Python standard library only)

## Quick Start

### 1. Navigate to Project

```bash
cd "C:/Users/SA TRADER/Desktop/all_Hackathon/Hackathon 1 Book/Todo_app_Mohsin"
```

### 2. Run the Application

```bash
cd src
python main.py
```

That's it! The application will start and display the main menu.

## Usage Example

```
===========================================
Welcome to Todo CLI App!
Phase 1: In-Memory Task Manager
========================================

⚠️  Note: All tasks are stored in memory only.
Tasks will be lost when you exit the application.

========================================
=== Todo CLI App ===
========================================
1. Add Task
2. List Tasks
3. Update Task
4. Mark Task Complete/Incomplete
5. Delete Task
6. Exit
========================================

Choose an option (1-6): 1

--- Add New Task ---
Enter task title: Buy groceries
Enter task description (press Enter to skip): Milk, bread, eggs

Task #1 added successfully!

Choose an option (1-6): 2

--- Task List ---

ID: 1 | [ ] | Buy groceries
Description: Milk, bread, eggs

Choose an option (1-6): 4

--- Mark Task Complete/Incomplete ---
Enter task ID: 1

Task #1 marked as complete!

Choose an option (1-6): 2

--- Task List ---

ID: 1 | [✓] | Buy groceries
Description: Milk, bread, eggs

Choose an option (1-6): 6

Thank you for using Todo CLI App!
Goodbye!
```

## Menu Options

| Option | Function | Description |
|--------|----------|-------------|
| 1 | Add Task | Create a new task with title and optional description |
| 2 | List Tasks | Display all tasks with their details and completion status |
| 3 | Update Task | Modify the title and/or description of an existing task |
| 4 | Mark Complete/Incomplete | Toggle task completion status |
| 5 | Delete Task | Remove a task from the list |
| 6 | Exit | Close the application |

## Input Validation

The application validates all user inputs and provides clear error messages:

- **Empty title**: "Title cannot be empty. Please try again." (retries input)
- **Title too long** (>100 chars): "Title too long. Maximum 100 characters." (retries input)
- **Description too long** (>250 chars): "Description too long. Maximum 250 characters." (retries input)
- **Invalid task ID** (non-numeric): "Invalid task ID. Must be a positive number."
- **Task not found**: "Task ID not found."
- **Invalid menu choice**: "Invalid option. Please choose 1-6."

## Phase 1 Limitations

⚠️ **Important**: This is Phase 1 with the following limitations:

- **No persistence**: Tasks are stored in memory only and are lost when you exit
- **Single session**: One user at a time, no concurrent access
- **In-memory only**: No database or file storage
- **ASCII text**: Basic text input only

These limitations will be addressed in future phases:
- **Phase 2**: Web frontend with database persistence (SQLite/PostgreSQL)
- **Phase 3**: AI chatbot integration for natural language task management
- **Phase 4**: Kubernetes deployment
- **Phase 5**: Cloud deployment with scalability

## Project Structure

```
src/
├── main.py            # Main menu loop and CLI handlers
├── task.py            # Task dataclass definition
├── task_manager.py    # CRUD operations (Create, Read, Update, Delete)
└── utils.py           # Input validation and formatting utilities

tests/
└── manual-test-checklist.md    # Manual testing scenarios

README.md              # This file
.gitignore             # Git ignore patterns
```

## Development

### Code Quality Standards

- **Modularity**: Each file has single responsibility
- **Functions**: Maximum 20 lines, single responsibility
- **Docstrings**: All functions documented with purpose, inputs, outputs
- **Error Handling**: Graceful handling without crashes
- **Beginner-Friendly**: Clear variable names, simple logic

### Testing

This Phase 1 uses manual testing. See `tests/manual-test-checklist.md` for comprehensive test scenarios covering:
- All 3 user stories (Add/View, Complete/Update, Delete)
- All 6 edge cases (invalid inputs, empty states, etc.)
- Performance tests (100 tasks, instant response)

To run manual tests:
1. Launch the application
2. Follow test scenarios in `tests/manual-test-checklist.md`
3. Verify expected behavior for each test case

## Troubleshooting

### "python: command not found"

Try `python3` instead:
```bash
cd src
python3 main.py
```

### "ModuleNotFoundError"

Make sure you're running from the `src/` directory:
```bash
cd src
python main.py
```

### "Python version too old"

Check your version:
```bash
python --version
```

If < 3.13, install Python 3.13+ from [python.org](https://www.python.org/downloads/)

## Contributing

This project follows **Spec-Driven Development (SDD)** methodology:

1. Specification (`specs/001-todo-cli-app/spec.md`)
2. Implementation Plan (`specs/001-todo-cli-app/plan.md`)
3. Implementation Tasks (`specs/001-todo-cli-app/tasks.md`)
4. Implementation (this code)

All changes must align with the specification and constitution principles.

## License

Educational project for hackathon demonstration.

## Version

**Version**: 1.0
**Date**: 2025-12-29
**Branch**: `001-todo-cli-app`
**Status**: Phase 1 Complete

---

Built with Python 3.13+ | No external dependencies | In-memory storage only
"# Phase-3" 
"# Phase-4-http-localhost-8000-docs" 
