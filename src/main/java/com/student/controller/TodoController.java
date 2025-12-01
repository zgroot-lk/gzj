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
    public Result<Todo> create(@RequestBody Todo todo) {
        return Result.success(todoService.save(todo));
    }

    @PutMapping("/{id}")
    public Result<Todo> update(@PathVariable Integer id, @RequestBody Todo todo) {
        todo.setId(id);
        return Result.success(todoService.update(todo));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        todoService.deleteById(id);
        return Result.success(null);
    }
}


