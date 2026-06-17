// frontend/src/types.ts

export type UserRole = "SUPER_ADMIN" | "BUREAU" | "CHAUFFEUR";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  licenseNumber?: string;
  licenseExpiry?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isPmr: boolean;
  observations?: string;
  createdAt: string;
}

export type VehicleStatus = "AVAILABLE" | "IN_SERVICE" | "MAINTENANCE";

export interface Vehicle {
  id: string;
  registrationNumber: string; // Immatriculation
  brand: string;
  model: string;
  type: string; // e.g. "PMR", "Standard"
  mileage: number;
  insuranceDate: string; // yyyy-mm-dd
  technicalInspectionDate: string; // yyyy-mm-dd
  status: VehicleStatus;
  createdAt: string;
}

export type RideStatus = "PLANNED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Ride {
  id: string;
  rideNumber: string;
  clientId: string;
  client: Client;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  departureAddress: string;
  arrivalAddress: string;
  chauffeurId?: string;
  chauffeur?: User;
  vehicleId?: string;
  vehicle?: Vehicle;
  isPmr: boolean;
  notes?: string;
  status: RideStatus;
  realMileage?: number;
  recurringReservationId?: string;
  createdAt: string;
}

export interface RecurringReservation {
  id: string;
  clientId: string;
  client: Client;
  startRideDate: string;
  startTime: string;
  departureAddress: string;
  arrivalAddress: string;
  chauffeurId?: string;
  chauffeur?: User;
  vehicleId?: string;
  vehicle?: Vehicle;
  isPmr: boolean;
  notes?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  untilDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: Client;
  date: string;
  amount: number;
  status: "UNPAID" | "PAID";
  rideId?: string;
  ride?: Ride;
  month?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "RIDE_ASSIGNED" | "RIDE_UPDATED" | "RIDE_CANCELLED" | "REMINDER";
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  details: string;
  createdAt: string;
}
