import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Building, Users, User } from "lucide-react";
import { Link } from "wouter";
import VacanciesTree from "@/components/VacanciesTree";

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted: boolean;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id: number | null;
  departments: { department_id: number }[];
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  department_id: number;
};

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  staff_units: number;
  current_count: number;
  vacancies: number;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
};

export default function Vacancies() {
  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием (как на главной странице) */}
      <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
        </div>
        
        <div className="text-center flex-1 text-2xl font-bold">
          Система управления персоналом
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <Button asChild variant="outline" className="flex items-center">
                <Link href="/">
                  На главную
                </Link>
              </Button>
            </div>
            <div>
              <CardTitle>Учет вакансий</CardTitle>
              <CardDescription>Анализ штатных единиц и занятых позиций в организационной структуре</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <VacanciesTree />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}