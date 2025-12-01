package com.student.service;

import com.student.entity.Grade;
import com.student.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GradeService {
    @Autowired
    private GradeRepository gradeRepository;

    public List<Grade> findAll(Integer studentId, Integer classId, String courseName,
                              String semester, String academicYear, LocalDate startDate, LocalDate endDate) {
        List<Grade> grades = gradeRepository.findAll();
        
        return grades.stream()
                .filter(g -> studentId == null || g.getStudentId().equals(studentId))
                .filter(g -> classId == null || g.getClassId().equals(classId))
                .filter(g -> courseName == null || g.getCourseName().contains(courseName))
                .filter(g -> semester == null || (g.getSemester() != null && g.getSemester().equals(semester)))
                .filter(g -> academicYear == null || (g.getAcademicYear() != null && g.getAcademicYear().equals(academicYear)))
                .filter(g -> startDate == null || (g.getExamDate() != null && !g.getExamDate().isBefore(startDate)))
                .filter(g -> endDate == null || (g.getExamDate() != null && !g.getExamDate().isAfter(endDate)))
                .collect(Collectors.toList());
    }

    @Transactional
    public Grade save(Grade grade) {
        if (grade.getFullScore() == null) {
            grade.setFullScore(new BigDecimal("100"));
        }
        return gradeRepository.save(grade);
    }

    @Transactional
    public Grade update(Grade grade) {
        Grade existing = gradeRepository.findById(grade.getId())
                .orElseThrow(() -> new RuntimeException("成绩记录不存在"));
        if (grade.getCourseName() != null) existing.setCourseName(grade.getCourseName());
        if (grade.getExamType() != null) existing.setExamType(grade.getExamType());
        if (grade.getScore() != null) existing.setScore(grade.getScore());
        if (grade.getFullScore() != null) existing.setFullScore(grade.getFullScore());
        if (grade.getSemester() != null) existing.setSemester(grade.getSemester());
        if (grade.getAcademicYear() != null) existing.setAcademicYear(grade.getAcademicYear());
        if (grade.getExamDate() != null) existing.setExamDate(grade.getExamDate());
        if (grade.getRemark() != null) existing.setRemark(grade.getRemark());
        return gradeRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        gradeRepository.deleteById(id);
    }
}


