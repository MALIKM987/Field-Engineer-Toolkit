export interface Measurement {
  id: string;
  name: string;
  value: number;
  unit: string;
  comment: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  date: string;
  measurements: Measurement[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  date: string;
}

export interface MeasurementFormData {
  name: string;
  value: string;
  unit: string;
  comment: string;
  timestamp: string;
}
