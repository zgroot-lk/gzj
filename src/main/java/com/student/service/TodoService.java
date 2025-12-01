package com.student.service;

import com.student.entity.Todo;
import com.student.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {
    @Autowired
    private TodoRepository todoRepository;

    public List<Todo> findAll(String status, String priority, LocalDate startDate, LocalDate endDate,
                             String assignee, Integer relatedStudentId, Integer relatedClassId) {
        List<Todo> todos = todoRepository.findAll();
        
        return todos.stream()
                .filter(t -> status == null || t.getStatus().name().equals(status))
                .filter(t -> priority == null || t.getPriority().name().equals(priority))
                .filter(t -> startDate == null || !t.getCreatedAt().toLocalDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getCreatedAt().toLocalDate().isAfter(endDate))
                .filter(t -> assignee == null || (t.getAssignee() != null && t.getAssignee().contains(assignee)))
                .filter(t -> relatedStudentId == null || (t.getRelatedStudentId() != null && t.getRelatedStudentId().equals(relatedStudentId)))
                .filter(t -> relatedClassId == null || (t.getRelatedClassId() != null && t.getRelatedClassId().equals(relatedClassId)))
                .collect(Collectors.toList());
    }

    public Todo findById(Integer id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("待办事项不存在"));
    }

    @Transactional
    public Todo save(Todo todo) {
        if (todo.getStatus() == null) {
            todo.setStatus(Todo.TodoStatus.待处理);
        }
        if (todo.getPriority() == null) {
            todo.setPriority(Todo.Priority.中);
        }
        return todoRepository.save(todo);
    }

    @Transactional
    public Todo update(Todo todo) {
        Todo existing = findById(todo.getId());
        if (todo.getTitle() != null) existing.setTitle(todo.getTitle());
        if (todo.getDescription() != null) existing.setDescription(todo.getDescription());
        if (todo.getStatus() != null) existing.setStatus(todo.getStatus());
        if (todo.getPriority() != null) existing.setPriority(todo.getPriority());
        if (todo.getAssignee() != null) existing.setAssignee(todo.getAssignee());
        if (todo.getDueDate() != null) existing.setDueDate(todo.getDueDate());
        if (todo.getRelatedStudentId() != null) existing.setRelatedStudentId(todo.getRelatedStudentId());
        if (todo.getRelatedClassId() != null) existing.setRelatedClassId(todo.getRelatedClassId());
        if (todo.getCompletedAt() != null) existing.setCompletedAt(todo.getCompletedAt());
        return todoRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        todoRepository.deleteById(id);
    }
}


