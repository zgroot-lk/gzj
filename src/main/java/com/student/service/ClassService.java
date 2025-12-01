package com.student.service;

import com.student.entity.Class;
import com.student.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassService {
    @Autowired
    private ClassRepository classRepository;

    public List<Class> findAll(String grade, String department, String className) {
        List<Class> classes = classRepository.findAll();
        
        return classes.stream()
                .filter(c -> grade == null || c.getGrade().equals(grade))
                .filter(c -> department == null || c.getDepartment().equals(department))
                .filter(c -> className == null || c.getClassName().contains(className))
                .collect(Collectors.toList());
    }

    public Class findById(Integer id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
    }

    @Transactional
    public Class save(Class clazz) {
        return classRepository.save(clazz);
    }

    @Transactional
    public Class update(Class clazz) {
        Class existing = findById(clazz.getId());
        if (clazz.getClassName() != null) existing.setClassName(clazz.getClassName());
        if (clazz.getGrade() != null) existing.setGrade(clazz.getGrade());
        if (clazz.getDepartment() != null) existing.setDepartment(clazz.getDepartment());
        if (clazz.getTeacherId() != null) existing.setTeacherId(clazz.getTeacherId());
        return classRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        classRepository.deleteById(id);
    }
}


