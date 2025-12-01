package com.student.service;

import com.student.entity.Attendance;
import com.student.entity.Grade;
import com.student.entity.Student;
import com.student.entity.Todo;
import com.student.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private GradeRepository gradeRepository;

    /**
     * 数量统计
     */
    public List<Map<String, Object>> getCount(String type,
                                              LocalDate startDate,
                                              LocalDate endDate,
                                              String grade,
                                              String department,
                                              Integer classId,
                                              String status) {
        if (endDate != null) {
            // 方便比较，把结束日期当作包含当天
            endDate = endDate;
        }

        switch (type) {
            case "students":
                return countStudents(startDate, endDate, grade, department, classId, status);
            case "todos":
                return countTodos(startDate, endDate, status);
            case "attendance":
                return countAttendance(startDate, endDate, grade, department, classId, status);
            case "grades":
                return countGrades(startDate, endDate, grade, department, classId);
            default:
                return Collections.emptyList();
        }
    }

    /**
     * 趋势统计（按天/周/月/年）
     */
    public List<Map<String, Object>> getTrend(String type,
                                              String groupBy,
                                              LocalDate startDate,
                                              LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.of(2020, 1, 1);
        }
        if (endDate == null) {
            endDate = LocalDate.of(2030, 12, 31);
        }

        DateTimeFormatter formatter;
        switch (groupBy) {
            case "week":
                formatter = DateTimeFormatter.ofPattern("YYYY-ww");
                break;
            case "month":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                break;
            case "year":
                formatter = DateTimeFormatter.ofPattern("yyyy");
                break;
            default:
                formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        }

        switch (type) {
            case "students":
                return trendStudents(startDate, endDate, formatter);
            case "todos":
                return trendTodos(startDate, endDate, formatter);
            case "attendance":
                return trendAttendance(startDate, endDate, formatter);
            case "grades":
                return trendGrades(startDate, endDate, formatter);
            default:
                return Collections.emptyList();
        }
    }

    /**
     * 数据对比
     */
    public Map<String, Object> getCompare(String type,
                                          LocalDate period1Start,
                                          LocalDate period1End,
                                          LocalDate period2Start,
                                          LocalDate period2End,
                                          String grade,
                                          String department,
                                          Integer classId) {
        Map<String, Object> result = new HashMap<>();

        switch (type) {
            case "students":
                compareStudents(result, period1Start, period1End, period2Start, period2End, grade, department, classId);
                break;
            case "attendance":
                compareAttendance(result, period1Start, period1End, period2Start, period2End, grade, department, classId);
                break;
            case "grades":
                compareGrades(result, period1Start, period1End, period2Start, period2End, grade, department, classId);
                break;
            default:
                break;
        }

        return result;
    }

    /**
     * 综合概览
     */
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();

        long studentCount = studentRepository.count();
        long classCount = classRepository.count();
        long gradeCount = gradeRepository.count();
        List<Todo> todos = todoRepository.findAll();
        List<Attendance> attendanceList = attendanceRepository.findAll();

        // todos 按状态统计
        List<Map<String, Object>> todoStats = todos.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus() != null ? t.getStatus().name() : "未知",
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("status", e.getKey());
                    m.put("total", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // 考勤统计
        long attendanceTotal = attendanceList.size();
        long attendanceCount = attendanceList.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.出勤)
                .count();
        long absenceCount = attendanceList.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.缺勤)
                .count();

        Map<String, Object> attendanceStats = new HashMap<>();
        attendanceStats.put("total", attendanceTotal);
        attendanceStats.put("attendance_count", attendanceCount);
        attendanceStats.put("absence_count", absenceCount);

        // 成绩统计
        List<Grade> grades = gradeRepository.findAll();
        BigDecimal avgScore = BigDecimal.ZERO;
        if (!grades.isEmpty()) {
            BigDecimal sum = grades.stream()
                    .filter(g -> g.getScore() != null)
                    .map(Grade::getScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long cnt = grades.stream().filter(g -> g.getScore() != null).count();
            if (cnt > 0) {
                avgScore = sum.divide(BigDecimal.valueOf(cnt), 2, RoundingMode.HALF_UP);
            }
        }
        Map<String, Object> gradeStats = new HashMap<>();
        gradeStats.put("total", gradeCount);
        gradeStats.put("avg_score", avgScore);

        overview.put("students", studentCount);
        overview.put("classes", classCount);
        overview.put("todos", todoStats);
        overview.put("attendance", attendanceStats);
        overview.put("grades", gradeStats);

        return overview;
    }

    /* ---------- 具体实现：数量统计 ---------- */

    private List<Map<String, Object>> countStudents(LocalDate startDate,
                                                    LocalDate endDate,
                                                    String grade,
                                                    String department,
                                                    Integer classId,
                                                    String status) {
        List<Student> students = studentRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        return students.stream()
                .filter(s -> startDate == null || (s.getEnrollmentDate() != null && !s.getEnrollmentDate().isBefore(startDate)))
                .filter(s -> endDate == null || (s.getEnrollmentDate() != null && !s.getEnrollmentDate().isAfter(endDate)))
                .filter(s -> status == null || (s.getStatus() != null && s.getStatus().name().equals(status)))
                .filter(s -> {
                    com.student.entity.Class clazz = classMap.get(s.getClassId());
                    if (clazz == null) return false;
                    if (grade != null && !grade.equals(clazz.getGrade())) return false;
                    if (department != null && !department.equals(clazz.getDepartment())) return false;
                    if (classId != null && !classId.equals(clazz.getId())) return false;
                    return true;
                })
                .collect(Collectors.groupingBy(s -> {
                    com.student.entity.Class clazz = classMap.get(s.getClassId());
                    String g = clazz != null && clazz.getGrade() != null ? clazz.getGrade() : "未知";
                    String d = clazz != null && clazz.getDepartment() != null ? clazz.getDepartment() : "未知";
                    String st = s.getStatus() != null ? s.getStatus().name() : "未知";
                    return g + "|" + d + "|" + st;
                }, Collectors.counting()))
                .entrySet()
                .stream()
                .map(e -> {
                    String[] parts = e.getKey().split("\\|");
                    Map<String, Object> m = new HashMap<>();
                    m.put("count", e.getValue());
                    m.put("grade", parts[0]);
                    m.put("department", parts[1]);
                    m.put("status", parts[2]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> countTodos(LocalDate startDate,
                                                 LocalDate endDate,
                                                 String status) {
        List<Todo> todos = todoRepository.findAll();
        return todos.stream()
                .filter(t -> startDate == null || (t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startDate)))
                .filter(t -> endDate == null || (t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isAfter(endDate)))
                .filter(t -> status == null || (t.getStatus() != null && t.getStatus().name().equals(status)))
                .collect(Collectors.groupingBy(t -> {
                    String st = t.getStatus() != null ? t.getStatus().name() : "未知";
                    String p = t.getPriority() != null ? t.getPriority().name() : "未知";
                    return st + "|" + p;
                }, Collectors.counting()))
                .entrySet()
                .stream()
                .map(e -> {
                    String[] parts = e.getKey().split("\\|");
                    Map<String, Object> m = new HashMap<>();
                    m.put("count", e.getValue());
                    m.put("status", parts[0]);
                    m.put("priority", parts[1]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> countAttendance(LocalDate startDate,
                                                      LocalDate endDate,
                                                      String grade,
                                                      String department,
                                                      Integer classId,
                                                      String status) {
        List<Attendance> attendanceList = attendanceRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        return attendanceList.stream()
                .filter(a -> startDate == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || !a.getAttendanceDate().isAfter(endDate))
                .filter(a -> status == null || (a.getStatus() != null && a.getStatus().name().equals(status)))
                .filter(a -> {
                    com.student.entity.Class clazz = classMap.get(a.getClassId());
                    if (clazz == null) return false;
                    if (grade != null && !grade.equals(clazz.getGrade())) return false;
                    if (department != null && !department.equals(clazz.getDepartment())) return false;
                    if (classId != null && !classId.equals(clazz.getId())) return false;
                    return true;
                })
                .collect(Collectors.groupingBy(a -> {
                    com.student.entity.Class clazz = classMap.get(a.getClassId());
                    String g = clazz != null && clazz.getGrade() != null ? clazz.getGrade() : "未知";
                    String d = clazz != null && clazz.getDepartment() != null ? clazz.getDepartment() : "未知";
                    String st = a.getStatus() != null ? a.getStatus().name() : "未知";
                    return st + "|" + g + "|" + d;
                }, Collectors.counting()))
                .entrySet()
                .stream()
                .map(e -> {
                    String[] parts = e.getKey().split("\\|");
                    Map<String, Object> m = new HashMap<>();
                    m.put("count", e.getValue());
                    m.put("status", parts[0]);
                    m.put("grade", parts[1]);
                    m.put("department", parts[2]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> countGrades(LocalDate startDate,
                                                  LocalDate endDate,
                                                  String grade,
                                                  String department,
                                                  Integer classId) {
        List<Grade> grades = gradeRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        // 过滤
        List<Grade> filtered = grades.stream()
                .filter(g -> startDate == null || (g.getExamDate() != null && !g.getExamDate().isBefore(startDate)))
                .filter(g -> endDate == null || (g.getExamDate() != null && !g.getExamDate().isAfter(endDate)))
                .filter(g -> {
                    com.student.entity.Class clazz = classMap.get(g.getClassId());
                    if (clazz == null) return false;
                    if (grade != null && !grade.equals(clazz.getGrade())) return false;
                    if (department != null && !department.equals(clazz.getDepartment())) return false;
                    if (classId != null && !classId.equals(clazz.getId())) return false;
                    return true;
                })
                .collect(Collectors.toList());

        // 按年级+部门分组，并统计数量和平均分
        Map<String, List<Grade>> grouped = filtered.stream()
                .collect(Collectors.groupingBy(g -> {
                    com.student.entity.Class clazz = classMap.get(g.getClassId());
                    String gName = clazz != null && clazz.getGrade() != null ? clazz.getGrade() : "未知";
                    String dName = clazz != null && clazz.getDepartment() != null ? clazz.getDepartment() : "未知";
                    return gName + "|" + dName;
                }));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Grade>> entry : grouped.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            List<Grade> list = entry.getValue();
            long count = list.size();
            BigDecimal avg = BigDecimal.ZERO;
            long scoreCnt = list.stream().filter(g -> g.getScore() != null).count();
            if (scoreCnt > 0) {
                BigDecimal sum = list.stream()
                        .filter(g -> g.getScore() != null)
                        .map(Grade::getScore)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                avg = sum.divide(BigDecimal.valueOf(scoreCnt), 2, RoundingMode.HALF_UP);
            }
            Map<String, Object> m = new HashMap<>();
            m.put("count", count);
            m.put("grade", parts[0]);
            m.put("department", parts[1]);
            m.put("avg_score", avg);
            result.add(m);
        }
        return result;
    }

    /* ---------- 具体实现：趋势统计 ---------- */

    private List<Map<String, Object>> trendStudents(LocalDate startDate,
                                                    LocalDate endDate,
                                                    DateTimeFormatter formatter) {
        return studentRepository.findAll().stream()
                .filter(s -> s.getEnrollmentDate() != null)
                .filter(s -> !s.getEnrollmentDate().isBefore(startDate) && !s.getEnrollmentDate().isAfter(endDate))
                .collect(Collectors.groupingBy(
                        s -> s.getEnrollmentDate().format(formatter),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> trendTodos(LocalDate startDate,
                                                 LocalDate endDate,
                                                 DateTimeFormatter formatter) {
        return todoRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null)
                .filter(t -> {
                    LocalDate d = t.getCreatedAt().toLocalDate();
                    return !d.isBefore(startDate) && !d.isAfter(endDate);
                })
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().toLocalDate().format(formatter),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> trendAttendance(LocalDate startDate,
                                                      LocalDate endDate,
                                                      DateTimeFormatter formatter) {
        return attendanceRepository.findAll().stream()
                .filter(a -> !a.getAttendanceDate().isBefore(startDate) && !a.getAttendanceDate().isAfter(endDate))
                .collect(Collectors.groupingBy(
                        a -> a.getAttendanceDate().format(formatter),
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    List<Attendance> list = e.getValue();
                    long total = list.size();
                    long attendanceCount = list.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.出勤).count();
                    long absenceCount = list.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.缺勤).count();
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", e.getKey());
                    m.put("count", total);
                    m.put("attendance_count", attendanceCount);
                    m.put("absence_count", absenceCount);
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> trendGrades(LocalDate startDate,
                                                  LocalDate endDate,
                                                  DateTimeFormatter formatter) {
        return gradeRepository.findAll().stream()
                .filter(g -> g.getExamDate() != null)
                .filter(g -> !g.getExamDate().isBefore(startDate) && !g.getExamDate().isAfter(endDate))
                .collect(Collectors.groupingBy(
                        g -> g.getExamDate().format(formatter),
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    List<Grade> list = e.getValue();
                    long count = list.size();
                    long scoreCnt = list.stream().filter(g -> g.getScore() != null).count();
                    BigDecimal avg = BigDecimal.ZERO;
                    if (scoreCnt > 0) {
                        BigDecimal sum = list.stream()
                                .filter(g -> g.getScore() != null)
                                .map(Grade::getScore)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        avg = sum.divide(BigDecimal.valueOf(scoreCnt), 2, RoundingMode.HALF_UP);
                    }
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", e.getKey());
                    m.put("count", count);
                    m.put("avg_score", avg);
                    return m;
                })
                .collect(Collectors.toList());
    }

    /* ---------- 具体实现：数据对比 ---------- */

    private void compareStudents(Map<String, Object> result,
                                 LocalDate p1Start,
                                 LocalDate p1End,
                                 LocalDate p2Start,
                                 LocalDate p2End,
                                 String grade,
                                 String department,
                                 Integer classId) {
        List<Student> all = studentRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        long p1Count = all.stream()
                .filter(s -> inPeriod(s.getEnrollmentDate(), p1Start, p1End))
                .filter(s -> matchClassFilter(s.getClassId(), classMap, grade, department, classId))
                .count();

        long p2Count = all.stream()
                .filter(s -> inPeriod(s.getEnrollmentDate(), p2Start, p2End))
                .filter(s -> matchClassFilter(s.getClassId(), classMap, grade, department, classId))
                .count();

        result.put("period1_count", p1Count);
        result.put("period2_count", p2Count);
    }

    private void compareAttendance(Map<String, Object> result,
                                   LocalDate p1Start,
                                   LocalDate p1End,
                                   LocalDate p2Start,
                                   LocalDate p2End,
                                   String grade,
                                   String department,
                                   Integer classId) {
        List<Attendance> all = attendanceRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        List<Attendance> p1 = all.stream()
                .filter(a -> inPeriod(a.getAttendanceDate(), p1Start, p1End))
                .filter(a -> matchClassFilter(a.getClassId(), classMap, grade, department, classId))
                .collect(Collectors.toList());

        List<Attendance> p2 = all.stream()
                .filter(a -> inPeriod(a.getAttendanceDate(), p2Start, p2End))
                .filter(a -> matchClassFilter(a.getClassId(), classMap, grade, department, classId))
                .collect(Collectors.toList());

        long p1Total = p1.size();
        long p1Attendance = p1.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.出勤).count();
        long p2Total = p2.size();
        long p2Attendance = p2.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.出勤).count();

        BigDecimal p1Rate = BigDecimal.ZERO;
        BigDecimal p2Rate = BigDecimal.ZERO;
        if (p1Total > 0) {
            p1Rate = BigDecimal.valueOf(p1Attendance * 100.0 / p1Total).setScale(1, RoundingMode.HALF_UP);
        }
        if (p2Total > 0) {
            p2Rate = BigDecimal.valueOf(p2Attendance * 100.0 / p2Total).setScale(1, RoundingMode.HALF_UP);
        }

        result.put("period1_count", p1Total);
        result.put("period1_rate", p1Rate);
        result.put("period2_count", p2Total);
        result.put("period2_rate", p2Rate);
    }

    private void compareGrades(Map<String, Object> result,
                               LocalDate p1Start,
                               LocalDate p1End,
                               LocalDate p2Start,
                               LocalDate p2End,
                               String grade,
                               String department,
                               Integer classId) {
        List<Grade> all = gradeRepository.findAll();
        Map<Integer, com.student.entity.Class> classMap = classRepository.findAll()
                .stream()
                .collect(Collectors.toMap(com.student.entity.Class::getId, Function.identity(), (a, b) -> a));

        List<Grade> p1 = all.stream()
                .filter(g -> inPeriod(g.getExamDate(), p1Start, p1End))
                .filter(g -> matchClassFilter(g.getClassId(), classMap, grade, department, classId))
                .collect(Collectors.toList());

        List<Grade> p2 = all.stream()
                .filter(g -> inPeriod(g.getExamDate(), p2Start, p2End))
                .filter(g -> matchClassFilter(g.getClassId(), classMap, grade, department, classId))
                .collect(Collectors.toList());

        result.put("period1_avg", calcAvgScore(p1));
        result.put("period2_avg", calcAvgScore(p2));
    }

    /* ---------- 辅助方法 ---------- */

    private boolean inPeriod(LocalDate date, LocalDate start, LocalDate end) {
        if (date == null) return false;
        if (start != null && date.isBefore(start)) return false;
        if (end != null && date.isAfter(end)) return false;
        return true;
    }

    private boolean matchClassFilter(Integer classId,
                                     Map<Integer, com.student.entity.Class> classMap,
                                     String grade,
                                     String department,
                                     Integer filterClassId) {
        com.student.entity.Class clazz = classMap.get(classId);
        if (clazz == null) return false;
        if (grade != null && !grade.equals(clazz.getGrade())) return false;
        if (department != null && !department.equals(clazz.getDepartment())) return false;
        if (filterClassId != null && !filterClassId.equals(clazz.getId())) return false;
        return true;
    }

    private BigDecimal calcAvgScore(List<Grade> list) {
        long cnt = list.stream().filter(g -> g.getScore() != null).count();
        if (cnt == 0) return BigDecimal.ZERO;
        BigDecimal sum = list.stream()
                .filter(g -> g.getScore() != null)
                .map(Grade::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(cnt), 2, RoundingMode.HALF_UP);
    }
}


