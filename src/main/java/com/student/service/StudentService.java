package com.student.service;

import com.student.entity.Student;
import com.student.entity.Class;
import com.student.repository.StudentRepository;
import com.student.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassRepository classRepository;

    public List<Student> findAll(String name, String studentNo, Integer classId, String grade,
                                String department, String status, LocalDate startDate, LocalDate endDate) {
        List<Student> students = studentRepository.findAll();
        
        return students.stream()
                .filter(s -> name == null || s.getName().contains(name))
                .filter(s -> studentNo == null || s.getStudentNo().contains(studentNo))
                .filter(s -> classId == null || s.getClassId().equals(classId))
                .filter(s -> status == null || s.getStatus().name().equals(status))
                .filter(s -> startDate == null || (s.getEnrollmentDate() != null && !s.getEnrollmentDate().isBefore(startDate)))
                .filter(s -> endDate == null || (s.getEnrollmentDate() != null && !s.getEnrollmentDate().isAfter(endDate)))
                .filter(s -> {
                    if (grade == null && department == null) return true;
                    Class clazz = classRepository.findById(s.getClassId()).orElse(null);
                    if (clazz == null) return false;
                    if (grade != null && !clazz.getGrade().equals(grade)) return false;
                    if (department != null && !clazz.getDepartment().equals(department)) return false;
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Student findById(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
    }

    @Transactional
    public Student save(Student student) {
        if (student.getStatus() == null) {
            student.setStatus(Student.StudentStatus.在读);
        }
        Student saved = studentRepository.save(student);
        // 更新班级学生人数
        updateClassStudentCount(student.getClassId());
        return saved;
    }

    @Transactional
    public Student update(Student student) {
        Student existing = findById(student.getId());
        Integer oldClassId = existing.getClassId();
        
        if (student.getName() != null) existing.setName(student.getName());
        if (student.getGender() != null) existing.setGender(student.getGender());
        if (student.getBirthDate() != null) existing.setBirthDate(student.getBirthDate());
        if (student.getPhone() != null) existing.setPhone(student.getPhone());
        if (student.getEmail() != null) existing.setEmail(student.getEmail());
        if (student.getAddress() != null) existing.setAddress(student.getAddress());
        if (student.getClassId() != null) existing.setClassId(student.getClassId());
        if (student.getEnrollmentDate() != null) existing.setEnrollmentDate(student.getEnrollmentDate());
        if (student.getStatus() != null) existing.setStatus(student.getStatus());
        
        Student saved = studentRepository.save(existing);
        
        // 如果班级变更，更新两个班级的学生人数
        if (student.getClassId() != null && !student.getClassId().equals(oldClassId)) {
            updateClassStudentCount(oldClassId);
            updateClassStudentCount(student.getClassId());
        }
        
        return saved;
    }

    @Transactional
    public void deleteById(Integer id) {
        Student student = findById(id);
        Integer classId = student.getClassId();
        studentRepository.deleteById(id);
        updateClassStudentCount(classId);
    }

    private void updateClassStudentCount(Integer classId) {
        Class clazz = classRepository.findById(classId).orElse(null);
        if (clazz != null) {
            long count = studentRepository.findByClassId(classId).size();
            clazz.setStudentCount((int) count);
            classRepository.save(clazz);
        }
    }
}


