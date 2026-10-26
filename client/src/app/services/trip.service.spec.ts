import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TripService } from './trip.service';

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

  it('should update trip', () => {
    const updateDto = { name: 'Updated Coast', startingDate: '2026-08-05' };
    const mockResponse = {
      id: 2,
      name: 'Updated Coast',
      startingDate: '2026-08-05',
      endingDate: '2026-08-05',
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: [],
      stops: []
    };

    service.updateTrip(2, updateDto).subscribe((res) => {
      expect(res.id).toBe(2);
      expect(res.name).toBe('Updated Coast');
      expect(res.startingDate).toBe('2026-08-05');
    });

    const req = httpTesting.expectOne('api/trips/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockResponse);
  });

  it('should reorder tasks', () => {
    service.reorderTasks([10, 20, 30]).subscribe();

    const req = httpTesting.expectOne('api/tasks/reorder');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ taskIds: [10, 20, 30] });
    req.flush(null);
  });

  it('should reorder stops', () => {
    service.reorderStops([101, 102, 103]).subscribe();

    const req = httpTesting.expectOne('api/stops/reorder');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ stopIds: [101, 102, 103] });
    req.flush(null);
  });

  it('should clone stop', () => {
    const cloneDto = {
      name: 'Yosemite Cloned',
      numberOfNights: 3,
      location: 'Yosemite West',
      telephoneNumber: '555-4321',
      confirmationCode: 'RES-777',
      siteNumber: 'Site 8',
      notes: 'Cloned note',
      stopDate: '2026-07-08',
      webAddress: 'https://example.com'
    };

    const mockStopResponse = {
      id: 5,
      name: 'Yosemite Cloned',
      stopDate: '2026-07-08',
      numberOfNights: 3,
      orderIndex: 1,
      arrivalTasks: [],
      departureTasks: []
    };

    service.cloneStop(1, cloneDto).subscribe((stop) => {
      expect(stop.id).toBe(5);
      expect(stop.name).toBe('Yosemite Cloned');
      expect(stop.orderIndex).toBe(1);
    });

    const req = httpTesting.expectOne('api/stops/1/clone');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(cloneDto);
    req.flush(mockStopResponse);
  });

  it('should update stop', () => {
    const updateDto = {
      name: 'Yosemite Updated',
      numberOfNights: 4,
      location: 'Yosemite Valley',
      telephoneNumber: '555-9999',
      confirmationCode: 'RES-888',
      siteNumber: 'Site 12',
      notes: 'Updated notes',
      webAddress: 'https://nps.gov/yose'
    };

    const mockStopResponse = {
      id: 1,
      name: 'Yosemite Updated',
      stopDate: '2026-07-08',
      numberOfNights: 4,
      orderIndex: 0,
      arrivalTasks: [],
      departureTasks: []
    };

    service.updateStop(1, updateDto).subscribe((stop) => {
      expect(stop.id).toBe(1);
      expect(stop.name).toBe('Yosemite Updated');
      expect(stop.numberOfNights).toBe(4);
    });

    const req = httpTesting.expectOne('api/stops/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockStopResponse);
  });

  it('should update task description', () => {
    const updateDto = { description: 'Updated Task Description' };
    const mockTaskResponse = {
      id: 42,
      description: 'Updated Task Description',
      status: 'INCOMPLETE',
      category: 'PRE_TRIP',
      orderIndex: 0
    };

    service.updateTask(42, updateDto).subscribe((task) => {
      expect(task.id).toBe(42);
      expect(task.description).toBe('Updated Task Description');
    });

    const req = httpTesting.expectOne('api/tasks/42');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockTaskResponse);
  });

  it('should get amenities list', () => {
    const mockAmenities = ['Scenic View', 'Trails', 'Water Access'];

    service.getAmenities().subscribe((amenities) => {
      expect(amenities.length).toBe(3);
      expect(amenities).toEqual(mockAmenities);
    });

    const req = httpTesting.expectOne('api/stops/amenities');
    expect(req.request.method).toBe('GET');
    req.flush(mockAmenities);
  });

  it('should get services list', () => {
    const mockServices = ['Firewood', 'Laundry', 'Propane'];

    service.getServices().subscribe((services) => {
      expect(services.length).toBe(3);
      expect(services).toEqual(mockServices);
    });

    const req = httpTesting.expectOne('api/stops/services');
    expect(req.request.method).toBe('GET');
    req.flush(mockServices);
  });

  it('should get users list', () => {
    const mockUsers = [
      { id: 1, username: 'alice', displayName: 'Alice' },
      { id: 2, username: 'bob', displayName: 'Bob' }
    ];

    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(2);
      expect(users[0].username).toBe('alice');
      expect(users[1].username).toBe('bob');
    });

    const req = httpTesting.expectOne('api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should add user to trip', () => {
    const mockTrip = {
      id: 1,
      name: 'Collab Trip',
      startingDate: '2026-08-01',
      endingDate: '2026-08-01',
      users: [{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }],
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: [],
      stops: []
    };

    service.addTripUser(1, 'bob').subscribe((trip) => {
      expect(trip.users?.length).toBe(2);
    });

    const req = httpTesting.expectOne('api/trips/1/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'bob' });
    req.flush(mockTrip);
  });

  it('should remove user from trip', () => {
    const mockTrip = {
      id: 1,
      name: 'Collab Trip',
      startingDate: '2026-08-01',
      endingDate: '2026-08-01',
      users: [{ id: 1, username: 'alice' }],
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: [],
      stops: []
    };

    service.removeTripUser(1, 'bob').subscribe((trip) => {
      expect(trip.users?.length).toBe(1);
    });

    const req = httpTesting.expectOne('api/trips/1/users/bob');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockTrip);
  });
});
