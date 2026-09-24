export enum TaskStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETED = 'COMPLETED'
}

export enum TaskCategory {
  PRE_TRIP = 'PRE_TRIP',
  DEPARTURE_DAY = 'DEPARTURE_DAY',
  RETURN_DAY = 'RETURN_DAY',
  ARRIVAL = 'ARRIVAL',
  DEPARTURE = 'DEPARTURE'
}

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  tripId?: number;
  stopId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  description: string;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}
