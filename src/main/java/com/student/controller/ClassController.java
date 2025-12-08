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
    public Result<Class> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Class clazz = convertToClass(data);
            return Result.success(classService.save(clazz));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    private Class convertToClass(java.util.Map<String, Object> data) {
        Class clazz = new Class();
        
        // 处理下划线命名到驼峰命名
        if (data.containsKey("class_name")) {
            clazz.setClassName((String) data.get("class_name"));
        }
        if (data.containsKey("grade")) {
            clazz.setGrade((String) data.get("grade"));
        }
        if (data.containsKey("department")) {
            clazz.setDepartment((String) data.get("department"));
        }
        if (data.containsKey("teacher_id")) {
            Object teacherIdObj = data.get("teacher_id");
            if (teacherIdObj instanceof Integer) {
                clazz.setTeacherId((Integer) teacherIdObj);
            } else if (teacherIdObj instanceof String && !((String) teacherIdObj).isEmpty()) {
                clazz.setTeacherId(Integer.parseInt((String) teacherIdObj));
            }
        }
        if (data.containsKey("student_count")) {
            Object studentCountObj = data.get("student_count");
            if (studentCountObj instanceof Integer) {
                clazz.setStudentCount((Integer) studentCountObj);
            } else if (studentCountObj instanceof String && !((String) studentCountObj).isEmpty()) {
                clazz.setStudentCount(Integer.parseInt((String) studentCountObj));
            }
        } else {
            clazz.setStudentCount(0);
        }
        
        return clazz;
    }

    @PutMapping("/{id}")
    public Result<Class> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Class clazz = convertToClass(data);
            clazz.setId(id);
            return Result.success(classService.update(clazz));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        classService.deleteById(id);
        return Result.success(null);
    }
}
