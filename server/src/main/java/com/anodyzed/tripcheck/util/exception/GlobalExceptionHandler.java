package com.anodyzed.tripcheck.util.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String,Object>> handleResourceNotFound (ResourceNotFoundException ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp",Instant.now().toString());
    body.put("status",HttpStatus.NOT_FOUND.value());
    body.put("error","Not Found");
    body.put("message",ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  } //handleResourceNotFound

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<Map<String,Object>> handleBadRequest (BadRequestException ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp",Instant.now().toString());
    body.put("status",HttpStatus.BAD_REQUEST.value());
    body.put("error","Bad Request");
    body.put("message",ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  } //handleBadRequest

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String,Object>> handleValidationExceptions (MethodArgumentNotValidException ex) {
    Map<String,Object> body = new HashMap<>();
    Map<String,String> errors = new HashMap<>();
    for(FieldError error : ex.getBindingResult().getFieldErrors()) {
      errors.put(error.getField(),error.getDefaultMessage());
    }
    body.put("timestamp",Instant.now().toString());
    body.put("status",HttpStatus.BAD_REQUEST.value());
    body.put("error","Validation Failed");
    body.put("errors",errors);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  } //handleValidationExceptions

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String,Object>> handleGenericException (Exception ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp",Instant.now().toString());
    body.put("status",HttpStatus.INTERNAL_SERVER_ERROR.value());
    body.put("error","Internal Server Error");
    body.put("message",ex.getMessage());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  } //handleGenericException

} //*GlobalExceptionHandler
