package com.student.controller;

import com.student.common.Result;
import com.student.dto.StudentWithClassDTO;
import com.student.entity.Class;
import com.student.entity.Student;
import com.student.repository.ClassRepository;
import com.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {
    @Autowired
    private StudentService studentService;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public Result<List<StudentWithClassDTO>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String studentNo,
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Student> students = studentService.findAll(name, studentNo, classId, grade, department, status, startDate, endDate);
        List<Class> classes = classRepository.findAll();
        // 按班级ID建立映射
        java.util.Map<Integer, Class> classMap = classes.stream()
                .collect(java.util.stream.Collectors.toMap(Class::getId, java.util.function.Function.identity(), (a, b) -> a));

        java.util.List<StudentWithClassDTO> result = students.stream().map(s -> {
            StudentWithClassDTO dto = new StudentWithClassDTO();
            dto.setId(s.getId());
            dto.setStudent_no(s.getStudentNo());
            dto.setName(s.getName());
            dto.setGender(s.getGender() != null ? s.getGender().name() : null);
            dto.setBirth_date(s.getBirthDate());
            dto.setPhone(s.getPhone());
            dto.setEmail(s.getEmail());
            dto.setAddress(s.getAddress());
            dto.setClass_id(s.getClassId());
            dto.setEnrollment_date(s.getEnrollmentDate());
            dto.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
            dto.setCreated_at(s.getCreatedAt());
            dto.setUpdated_at(s.getUpdatedAt());

            Class clazz = classMap.get(s.getClassId());
            if (clazz != null) {
                dto.setClass_name(clazz.getClassName());
                dto.setGrade(clazz.getGrade());
                dto.setDepartment(clazz.getDepartment());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<StudentWithClassDTO> getById(@PathVariable Integer id) {
        Student s = studentService.findById(id);
        Class clazz = classRepository.findById(s.getClassId()).orElse(null);

        StudentWithClassDTO dto = new StudentWithClassDTO();
        dto.setId(s.getId());
        dto.setStudent_no(s.getStudentNo());
        dto.setName(s.getName());
        dto.setGender(s.getGender() != null ? s.getGender().name() : null);
        dto.setBirth_date(s.getBirthDate());
        dto.setPhone(s.getPhone());
        dto.setEmail(s.getEmail());
        dto.setAddress(s.getAddress());
        dto.setClass_id(s.getClassId());
        dto.setEnrollment_date(s.getEnrollmentDate());
        dto.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
        dto.setCreated_at(s.getCreatedAt());
        dto.setUpdated_at(s.getUpdatedAt());
        if (clazz != null) {
            dto.setClass_name(clazz.getClassName());
            dto.setGrade(clazz.getGrade());
            dto.setDepartment(clazz.getDepartment());
        }
        return Result.success(dto);
    }

    @PostMapping
    public Result<Student> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Student student = convertToStudent(data);
            return Result.success(studentService.save(student));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    private Student convertToStudent(java.util.Map<String, Object> data) {
        Student student = new Student();
        
        // 处理下划线命名到驼峰命名
        if (data.containsKey("student_no")) {
            student.setStudentNo((String) data.get("student_no"));
        }
        if (data.containsKey("name")) {
            student.setName((String) data.get("name"));
        }
        if (data.containsKey("gender")) {
            String genderStr = (String) data.get("gender");
            if ("男".equals(genderStr)) {
                student.setGender(Student.Gender.男);
            } else if ("女".equals(genderStr)) {
                student.setGender(Student.Gender.女);
            }
        }
        if (data.containsKey("birth_date") && data.get("birth_date") != null) {
            String birthDateStr = (String) data.get("birth_date");
            student.setBirthDate(java.time.LocalDate.parse(birthDateStr));
        }
        if (data.containsKey("phone")) {
            student.setPhone((String) data.get("phone"));
        }
        if (data.containsKey("email")) {
            student.setEmail((String) data.get("email"));
        }
        if (data.containsKey("address")) {
            student.setAddress((String) data.get("address"));
        }
        if (data.containsKey("class_id")) {
            Object classIdObj = data.get("class_id");
            if (classIdObj instanceof Integer) {
                student.setClassId((Integer) classIdObj);
            } else if (classIdObj instanceof String) {
                student.setClassId(Integer.parseInt((String) classIdObj));
            }
        }
        if (data.containsKey("enrollment_date") && data.get("enrollment_date") != null) {
            String enrollmentDateStr = (String) data.get("enrollment_date");
            student.setEnrollmentDate(java.time.LocalDate.parse(enrollmentDateStr));
        }
        if (data.containsKey("status")) {
            String statusStr = (String) data.get("status");
            if ("在读".equals(statusStr)) {
                student.setStatus(Student.StudentStatus.在读);
            } else if ("休学".equals(statusStr)) {
                student.setStatus(Student.StudentStatus.休学);
            } else if ("退学".equals(statusStr)) {
                student.setStatus(Student.StudentStatus.退学);
            } else if ("毕业".equals(statusStr)) {
                student.setStatus(Student.StudentStatus.毕业);
            }
        }
        
        return student;
    }

    @PutMapping("/{id}")
    public Result<Student> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Student student = convertToStudent(data);
            student.setId(id);
            return Result.success(studentService.update(student));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        studentService.deleteById(id);
        return Result.success(null);
    }
}


