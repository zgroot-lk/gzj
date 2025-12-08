package com.student.controller;

import com.student.common.Result;
import com.student.dto.GradeDTO;
import com.student.entity.Class;
import com.student.entity.Grade;
import com.student.entity.Student;
import com.student.repository.ClassRepository;
import com.student.repository.StudentRepository;
import com.student.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/grades")
public class GradeController {
    @Autowired
    private GradeService gradeService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public Result<List<GradeDTO>> getAll(
            @RequestParam(required = false) Integer studentId,
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String courseName,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Grade> list = gradeService.findAll(studentId, classId, courseName, semester, academicYear, startDate, endDate);

        java.util.Set<Integer> studentIds = list.stream().map(Grade::getStudentId).collect(java.util.stream.Collectors.toSet());
        java.util.Set<Integer> classIds = list.stream().map(Grade::getClassId).collect(java.util.stream.Collectors.toSet());
        java.util.Map<Integer, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(java.util.stream.Collectors.toMap(Student::getId, java.util.function.Function.identity(), (a, b) -> a));
        java.util.Map<Integer, Class> classMap = classRepository.findAllById(classIds).stream()
                .collect(java.util.stream.Collectors.toMap(Class::getId, java.util.function.Function.identity(), (a, b) -> a));

        List<GradeDTO> result = list.stream().map(g -> {
            GradeDTO dto = new GradeDTO();
            dto.setId(g.getId());
            dto.setStudent_id(g.getStudentId());
            dto.setClass_id(g.getClassId());
            dto.setCourse_name(g.getCourseName());
            dto.setExam_type(g.getExamType());
            dto.setScore(g.getScore());
            dto.setFull_score(g.getFullScore());
            dto.setSemester(g.getSemester());
            dto.setAcademic_year(g.getAcademicYear());
            dto.setExam_date(g.getExamDate());
            dto.setRemark(g.getRemark());
            dto.setCreated_at(g.getCreatedAt());
            dto.setUpdated_at(g.getUpdatedAt());

            Student s = studentMap.get(g.getStudentId());
            if (s != null) {
                dto.setStudent_name(s.getName());
                dto.setStudent_no(s.getStudentNo());
            }
            Class c = classMap.get(g.getClassId());
            if (c != null) {
                dto.setClass_name(c.getClassName());
                dto.setGrade(c.getGrade());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return Result.success(result);
    }

    @PostMapping
    public Result<Grade> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Grade grade = convertToGrade(data);
            return Result.success(gradeService.save(grade));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Grade> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Grade grade = convertToGrade(data);
            grade.setId(id);
            return Result.success(gradeService.update(grade));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    private Grade convertToGrade(java.util.Map<String, Object> data) {
        Grade grade = new Grade();
        
        if (data.containsKey("student_id")) {
            Object obj = data.get("student_id");
            if (obj instanceof Integer) {
                grade.setStudentId((Integer) obj);
            } else if (obj instanceof String) {
                grade.setStudentId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("class_id")) {
            Object obj = data.get("class_id");
            if (obj instanceof Integer) {
                grade.setClassId((Integer) obj);
            } else if (obj instanceof String) {
                grade.setClassId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("course_name")) {
            grade.setCourseName((String) data.get("course_name"));
        }
        if (data.containsKey("exam_type")) {
            grade.setExamType((String) data.get("exam_type"));
        }
        if (data.containsKey("score")) {
            Object scoreObj = data.get("score");
            if (scoreObj instanceof Number) {
                grade.setScore(new java.math.BigDecimal(scoreObj.toString()));
            } else if (scoreObj instanceof String && !((String) scoreObj).isEmpty()) {
                grade.setScore(new java.math.BigDecimal((String) scoreObj));
            }
        }
        if (data.containsKey("full_score")) {
            Object fullScoreObj = data.get("full_score");
            if (fullScoreObj instanceof Number) {
                grade.setFullScore(new java.math.BigDecimal(fullScoreObj.toString()));
            } else if (fullScoreObj instanceof String && !((String) fullScoreObj).isEmpty()) {
                grade.setFullScore(new java.math.BigDecimal((String) fullScoreObj));
            }
        }
        if (data.containsKey("semester")) {
            grade.setSemester((String) data.get("semester"));
        }
        if (data.containsKey("academic_year")) {
            grade.setAcademicYear((String) data.get("academic_year"));
        }
        if (data.containsKey("exam_date") && data.get("exam_date") != null) {
            String dateStr = (String) data.get("exam_date");
            grade.setExamDate(java.time.LocalDate.parse(dateStr));
        }
        if (data.containsKey("remark")) {
            grade.setRemark((String) data.get("remark"));
        }
        
        return grade;
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        gradeService.deleteById(id);
        return Result.success(null);
    }
}


