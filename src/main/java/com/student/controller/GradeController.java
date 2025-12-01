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
    public Result<Grade> create(@RequestBody Grade grade) {
        return Result.success(gradeService.save(grade));
    }

    @PutMapping("/{id}")
    public Result<Grade> update(@PathVariable Integer id, @RequestBody Grade grade) {
        grade.setId(id);
        return Result.success(gradeService.update(grade));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        gradeService.deleteById(id);
        return Result.success(null);
    }
}


