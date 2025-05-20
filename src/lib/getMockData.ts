import { mockDb, mockEmployees, mockSession } from "@/app/data/mock-data";

export function getMockEmployees() {
  return mockEmployees;
}


export function getMockSessionUser(){
  return mockSession;
}

export function getMockDb(){
  return mockDb
}