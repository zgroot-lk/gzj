package com.student.controller;

import com.student.common.Result;
import com.student.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {
    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/count")
    public Result<?> getCount(
            @RequestParam String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String status) {
        return Result.success(statisticsService.getCount(type, startDate, endDate, grade, department, classId, status));
    }

    @GetMapping("/trend")
    public Result<?> getTrend(
            @RequestParam String type,
            @RequestParam(required = false, defaultValue = "day") String groupBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(statisticsService.getTrend(type, groupBy, startDate, endDate));
    }

    @GetMapping("/compare")
    public Result<?> getCompare(
            @RequestParam String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period1Start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period1End,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period2Start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate period2End,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer classId) {
        return Result.success(statisticsService.getCompare(type, period1Start, period1End, period2Start, period2End, grade, department, classId));
    }

    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverview() {
        return Result.success(statisticsService.getOverview());
    }
}


