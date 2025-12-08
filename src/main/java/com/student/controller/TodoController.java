package com.student.controller;

import com.student.common.Result;
import com.student.entity.Todo;
import com.student.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/todos")
public class TodoController {
    @Autowired
    private TodoService todoService;

    @GetMapping
    public Result<List<Todo>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) Integer relatedStudentId,
            @RequestParam(required = false) Integer relatedClassId) {
        return Result.success(todoService.findAll(status, priority, startDate, endDate, assignee, relatedStudentId, relatedClassId));
    }

    @GetMapping("/{id}")
    public Result<Todo> getById(@PathVariable Integer id) {
        return Result.success(todoService.findById(id));
    }

    @PostMapping
    public Result<Todo> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Todo todo = convertToTodo(data);
            return Result.success(todoService.save(todo));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Todo> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Todo todo = convertToTodo(data);
            todo.setId(id);
            return Result.success(todoService.update(todo));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    private Todo convertToTodo(java.util.Map<String, Object> data) {
        Todo todo = new Todo();
        
        if (data.containsKey("title")) {
            todo.setTitle((String) data.get("title"));
        }
        if (data.containsKey("description")) {
            todo.setDescription((String) data.get("description"));
        }
        if (data.containsKey("status")) {
            String statusStr = (String) data.get("status");
            if ("待处理".equals(statusStr)) {
                todo.setStatus(Todo.TodoStatus.待处理);
            } else if ("进行中".equals(statusStr)) {
                todo.setStatus(Todo.TodoStatus.进行中);
            } else if ("已完成".equals(statusStr)) {
                todo.setStatus(Todo.TodoStatus.已完成);
            } else if ("已取消".equals(statusStr)) {
                todo.setStatus(Todo.TodoStatus.已取消);
            }
        }
        if (data.containsKey("priority")) {
            String priorityStr = (String) data.get("priority");
            if ("低".equals(priorityStr)) {
                todo.setPriority(Todo.Priority.低);
            } else if ("中".equals(priorityStr)) {
                todo.setPriority(Todo.Priority.中);
            } else if ("高".equals(priorityStr)) {
                todo.setPriority(Todo.Priority.高);
            } else if ("紧急".equals(priorityStr)) {
                todo.setPriority(Todo.Priority.紧急);
            }
        }
        if (data.containsKey("assignee")) {
            todo.setAssignee((String) data.get("assignee"));
        }
        if (data.containsKey("due_date") && data.get("due_date") != null) {
            String dueDateStr = (String) data.get("due_date");
            todo.setDueDate(java.time.LocalDate.parse(dueDateStr));
        }
        if (data.containsKey("related_student_id")) {
            Object obj = data.get("related_student_id");
            if (obj instanceof Integer) {
                todo.setRelatedStudentId((Integer) obj);
            } else if (obj instanceof String && !((String) obj).isEmpty()) {
                todo.setRelatedStudentId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("related_class_id")) {
            Object obj = data.get("related_class_id");
            if (obj instanceof Integer) {
                todo.setRelatedClassId((Integer) obj);
            } else if (obj instanceof String && !((String) obj).isEmpty()) {
                todo.setRelatedClassId(Integer.parseInt((String) obj));
            }
        }
        
        return todo;
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        todoService.deleteById(id);
        return Result.success(null);
    }
}


