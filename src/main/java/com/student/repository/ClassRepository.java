package com.student.repository;

import com.student.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, Integer> {
    List<Class> findByGrade(String grade);
    List<Class> findByDepartment(String department);
    List<Class> findByClassNameContaining(String className);
}


