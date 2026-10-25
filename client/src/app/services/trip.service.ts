import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripDetail, TripSummary, CreateTripDto, UpdateTripDto } from '../models/trip.model';
import { Stop, CreateStopDto, CloneStopDto, UpdateStopDto } from '../models/stop.model';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../models/task.model';
import { UserSummary } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  private baseUrl = 'api/trips';
  private stopUrl = 'api/stops';
  private taskUrl = 'api/tasks';
  private userUrl = 'api/users';

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.userUrl);
  }

  addTripUser(tripId: number, username: string): Observable<TripDetail> {
    return this.http.post<TripDetail>(`${this.baseUrl}/${tripId}/users`, { username });
  }

  removeTripUser(tripId: number, username: string): Observable<TripDetail> {
    return this.http.delete<TripDetail>(`${this.baseUrl}/${tripId}/users/${encodeURIComponent(username)}`);
  }

  getTrips(): Observable<TripSummary[]> {
    return this.http.get<TripSummary[]>(this.baseUrl);
  }

  getTrip(id: number): Observable<TripDetail> {
    return this.http.get<TripDetail>(`${this.baseUrl}/${id}`);
  }

  createTrip(dto: CreateTripDto): Observable<TripDetail> {
    return this.http.post<TripDetail>(this.baseUrl, dto);
  }

  updateTrip(id: number, dto: UpdateTripDto): Observable<TripDetail> {
    return this.http.put<TripDetail>(`${this.baseUrl}/${id}`, dto);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addStop(tripId: number, dto: CreateStopDto): Observable<Stop> {
    return this.http.post<Stop>(`${this.baseUrl}/${tripId}/stops`, dto);
  }

  updateStop(stopId: number, dto: UpdateStopDto): Observable<Stop> {
    return this.http.put<Stop>(`${this.stopUrl}/${stopId}`, dto);
  }

  cloneStop(stopId: number, dto: CloneStopDto): Observable<Stop> {
    return this.http.post<Stop>(`${this.stopUrl}/${stopId}/clone`, dto);
  }

  deleteStop(stopId: number): Observable<void> {
    return this.http.delete<void>(`${this.stopUrl}/${stopId}`);
  }

  getAmenities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.stopUrl}/amenities`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.stopUrl}/services`);
  }

  addPreTripTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/pre-trip`, dto);
  }

  addDepartureDayTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/departure-day`, dto);
  }

  addReturnDayTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/return-day`, dto);
  }

  addArrivalTask(stopId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.stopUrl}/${stopId}/tasks/arrival`, dto);
  }

  addDepartureTask(stopId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.stopUrl}/${stopId}/tasks/departure`, dto);
  }

  updateTask(taskId: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.taskUrl}/${taskId}`, dto);
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.taskUrl}/${taskId}/status`, { status });
  }

  reorderTasks(taskIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.taskUrl}/reorder`, { taskIds });
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${taskId}`);
  }
}
