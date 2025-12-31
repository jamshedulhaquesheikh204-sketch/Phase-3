"""
Automated test script for Todo CLI App Phase 1
"""

import sys
from pathlib import Path

# Add the project root to the path to allow imports
sys.path.insert(0, str(Path(__file__).parent))

from src.task_manager import TaskManager
from src.task import Task
from src.utils import validate_title, validate_description, format_task_display

def test_add_task():
    """Test adding tasks"""
    print("Testing: Add Task...")
    tm = TaskManager()

    # Test valid task
    success, msg, task_id = tm.add_task("Buy groceries", "Milk and bread")
    assert success == True, "Should add valid task"
    assert task_id == 1, "First task should have ID 1"
    print(f"[OK] Add task: {msg}")

    # Test empty title
    success, msg, task_id = tm.add_task("", "Description")
    assert success == False, "Should reject empty title"
    print(f"[OK] Reject empty title: {msg}")

    # Test long title
    success, msg, task_id = tm.add_task("a" * 101, "Description")
    assert success == False, "Should reject long title"
    print(f"[OK] Reject long title: {msg}")

    # Test long description
    success, msg, task_id = tm.add_task("Valid title", "b" * 251)
    assert success == False, "Should reject long description"
    print(f"[OK] Reject long description: {msg}")

    print("[PASS] Add Task: PASSED\n")

def test_list_tasks():
    """Test listing tasks"""
    print("Testing: List Tasks...")
    tm = TaskManager()

    # Empty list
    tasks = tm.list_tasks()
    assert len(tasks) == 0, "Should return empty list"
    print("[OK] Empty list returns []")

    # Add tasks
    tm.add_task("Task 1", "First task")
    tm.add_task("Task 2", "Second task")
    tm.add_task("Task 3", "Third task")

    tasks = tm.list_tasks()
    assert len(tasks) == 3, "Should return 3 tasks"
    assert tasks[0].id == 1, "First task should have ID 1"
    assert tasks[1].id == 2, "Second task should have ID 2"
    assert tasks[2].id == 3, "Third task should have ID 3"
    print(f"[OK] List shows {len(tasks)} tasks in correct order")

    print("[PASS] List Tasks: PASSED\n")

def test_mark_complete():
    """Test marking tasks complete/incomplete"""
    print("Testing: Mark Complete...")
    tm = TaskManager()

    # Add task
    tm.add_task("Task 1", "Test task")

    # Mark complete
    success, msg = tm.toggle_complete(1)
    assert success == True, "Should mark task complete"
    task = tm.get_task(1)
    assert task.completed == True, "Task should be completed"
    print(f"[OK] Mark complete: {msg}")

    # Mark incomplete
    success, msg = tm.toggle_complete(1)
    assert success == True, "Should mark task incomplete"
    task = tm.get_task(1)
    assert task.completed == False, "Task should be incomplete"
    print(f"[OK] Mark incomplete: {msg}")

    # Invalid ID
    success, msg = tm.toggle_complete(999)
    assert success == False, "Should reject invalid ID"
    print(f"[OK] Reject invalid ID: {msg}")

    print("[PASS] Mark Complete: PASSED\n")

def test_delete_task():
    """Test deleting tasks"""
    print("Testing: Delete Task...")
    tm = TaskManager()

    # Add tasks
    tm.add_task("Task 1", "First")
    tm.add_task("Task 2", "Second")
    tm.add_task("Task 3", "Third")

    # Delete middle task
    success, msg, deleted = tm.delete_task(2)
    assert success == True, "Should delete task"
    assert deleted.id == 2, "Should return deleted task"
    print(f"[OK] Delete task: {msg}")

    # Verify task is gone
    tasks = tm.list_tasks()
    assert len(tasks) == 2, "Should have 2 tasks remaining"
    assert tasks[0].id == 1, "Task 1 should remain"
    assert tasks[1].id == 3, "Task 3 should remain"
    print("[OK] Task removed from list")

    # Delete invalid ID
    success, msg, deleted = tm.delete_task(999)
    assert success == False, "Should reject invalid ID"
    assert deleted == None, "Should return None for invalid ID"
    print(f"[OK] Reject invalid ID: {msg}")

    print("[PASS] Delete Task: PASSED\n")

def test_update_task():
    """Test updating tasks"""
    print("Testing: Update Task...")
    tm = TaskManager()

    # Add task
    tm.add_task("Original Title", "Original Description")

    # Update title only
    success, msg = tm.update_task(1, title="New Title")
    assert success == True, "Should update title"
    task = tm.get_task(1)
    assert task.title == "New Title", "Title should be updated"
    assert task.description == "Original Description", "Description should remain"
    print(f"[OK] Update title: {msg}")

    # Update description only
    success, msg = tm.update_task(1, description="New Description")
    assert success == True, "Should update description"
    task = tm.get_task(1)
    assert task.title == "New Title", "Title should remain"
    assert task.description == "New Description", "Description should be updated"
    print(f"[OK] Update description: {msg}")

    # Invalid ID
    success, msg = tm.update_task(999, title="Test")
    assert success == False, "Should reject invalid ID"
    print(f"[OK] Reject invalid ID: {msg}")

    print("[PASS] Update Task: PASSED\n")

def test_edge_cases():
    """Test edge cases"""
    print("Testing: Edge Cases...")
    tm = TaskManager()

    # Task with no description
    success, msg, task_id = tm.add_task("Task without desc", "")
    assert success == True, "Should accept empty description"
    task = tm.get_task(task_id)
    assert task.description == "", "Description should be empty string"
    print("[OK] Empty description accepted")

    # Task formatting
    display = format_task_display(task)
    assert "[ ]" in display, "Should show incomplete status"
    assert "Task without desc" in display, "Should show title"
    print("[OK] Task display formatting correct")

    # Mark complete and check formatting
    tm.toggle_complete(task_id)
    display = format_task_display(task)
    assert "[X]" in display, "Should show complete status"
    print("[OK] Complete status formatting correct")

    print("[PASS] Edge Cases: PASSED\n")

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("Todo CLI App - Automated Test Suite")
    print("Phase 1: In-Memory Storage")
    print("=" * 50)
    print()

    try:
        test_add_task()
        test_list_tasks()
        test_mark_complete()
        test_delete_task()
        test_update_task()
        test_edge_cases()

        print("=" * 50)
        print("[PASS] ALL TESTS PASSED!")
        print("=" * 50)
        print("\n*** Phase 1 implementation is complete and working correctly!")

    except AssertionError as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        return False

    return True

if __name__ == "__main__":
    run_all_tests()
