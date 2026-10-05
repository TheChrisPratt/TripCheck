import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TripService } from './trip.service';
import { TaskCategory, TaskStatus } from '../models/task.model';

describe('TripService', () => {
  let service: TripService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TripService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TripService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get trips list', () => {
    const mockTrips = [
      {
        id: 1,
        name: 'Summer Roadtrip',
        startingDate: '2026-07-01',
        endingDate: '2026-07-10',
        stopCount: 3,
        totalTaskCount: 10,
        completedTaskCount: 5
      }
    ];

    service.getTrips().subscribe((trips) => {
      expect(trips.length).toBe(1);
      expect(trips[0].name).toBe('Summer Roadtrip');
    });

    const req = httpTesting.expectOne('api/trips');
    expect(req.request.method).toBe('GET');
    req.flush(mockTrips);
  });

  it('should create trip', () => {
    const tripDto = { name: 'Pacific Coast', startingDate: '2026-08-01' };
    const mockResponse = {
      id: 2,
      name: 'Pacific Coast',
      startingDate: '2026-08-01',
      endingDate: '2026-08-01',
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: [],
      stops: []
    };

    service.createTrip(tripDto).subscribe((res) => {
      expect(res.id).toBe(2);
      expect(res.name).toBe('Pacific Coast');
    });

    const req = httpTesting.expectOne('api/trips');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(tripDto);
    req.flush(mockResponse);
  });

  it('should update task status', () => {
    const mockTask = {
      id: 5,
      description: 'Check oil',
      status: TaskStatus.COMPLETED,
      category: TaskCategory.PRE_TRIP
    };

    service.updateTaskStatus(5, TaskStatus.COMPLETED).subscribe((res) => {
      expect(res.status).toBe(TaskStatus.COMPLETED);
    });

    const req = httpTesting.expectOne('api/tasks/5/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: TaskStatus.COMPLETED });
    req.flush(mockTask);
  });
});
