package com.student.controller;

import com.student.common.Result;
import com.student.dto.ClassDTO;
import com.student.entity.Class;
import com.student.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/classes")
public class ClassController {
    @Autowired
    private ClassService classService;

    @GetMapping
    public Result<List<ClassDTO>> getAll(
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String className) {
        List<Class> list = classService.findAll(grade, department, className);
        List<ClassDTO> result = list.stream().map(c -> {
            ClassDTO dto = new ClassDTO();
            dto.setId(c.getId());
            dto.setClass_name(c.getClassName());
            dto.setGrade(c.getGrade());
            dto.setDepartment(c.getDepartment());
            dto.setTeacher_id(c.getTeacherId());
            dto.setStudent_count(c.getStudentCount());
            dto.setCreated_at(c.getCreatedAt());
            dto.setUpdated_at(c.getUpdatedAt());
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Class> getById(@PathVariable Integer id) {
        return Result.success(classService.findById(id));
    }

    @PostMapping
    public Result<Class> create(@RequestBody Class clazz) {
        return Result.success(classService.save(clazz));
    }

    @PutMapping("/{id}")
    public Result<Class> update(@PathVariable Integer id, @RequestBody Class clazz) {
        clazz.setId(id);
        return Result.success(classService.update(clazz));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        classService.deleteById(id);
        return Result.success(null);
    }
}
