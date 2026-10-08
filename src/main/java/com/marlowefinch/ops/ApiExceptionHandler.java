package com.marlowefinch.ops;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Gives invalid API input the shape {@code {"errors": [...]}} with status 400. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Map<String, List<String>>> invalidRequest(InvalidRequestException e) {
        return ResponseEntity.badRequest().body(Map.of("errors", e.errors()));
    }
}
