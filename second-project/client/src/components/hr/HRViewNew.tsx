import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from '@/hooks/use-toast';
import { OrgUnit, Employee } from '@shared/schema';
import AddUnitModal from './AddUnitModal';
import { organizeTree } from '@/lib/tree-utils';

/**
 * HR View - основной компонент для просмотра и управления организационной структурой
 */
export default function HRViewNew() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Загрузка данных организационных единиц
  const { 
    data: orgUnits = [], 
    isLoading: isLoadingUnits,
    isError: isErrorUnits,
    refetch: refetchUnits
  } = useQuery({
    queryKey: ['/api/org-units'],
    refetchOnWindowFocus: false,
  });
  
  // Загрузка данных сотрудников
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    isError: isErrorEmployees,
    refetch: refetchEmployees
  } = useQuery({
    queryKey: ['/api/employees'],
    refetchOnWindowFocus: false,
  });
  
  // Состояние загрузки
  const isLoading = isLoadingUnits || isLoadingEmployees;
  const isError = isErrorUnits || isErrorEmployees;
  
  // Обработка кнопки добавления нового элемента
  const handleAddClick = (parentId: number | null = null) => {
    setSelectedParentId(parentId);
    setAddModalOpen(true);
  };
  
  // Обработка успешного добавления
  const handleAddSuccess = () => {
    refetchUnits();
    refetchEmployees();
    setAddModalOpen(false);
    toast({
      title: "Успешно",
      description: "Элемент успешно добавлен",
    });
  };
  
  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-500">Загрузка организационной структуры...</p>
        </div>
      </div>
    );
  }
  
  // Если произошла ошибка, показываем сообщение об ошибке
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-lg text-red-500 mb-4">Ошибка загрузки данных</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            onClick={() => {
              refetchUnits();
              refetchEmployees();
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }
  
  // Проверяем есть ли элементы в орг. структуре
  const hasOrgUnits = orgUnits.length > 0;
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full p-4">
        {!hasOrgUnits ? (
          // Пустое состояние - показываем большой плюсик
          <div className="empty-state">
            <div 
              className="big-plus-button"
              onClick={() => handleAddClick(null)}
              title="Добавить первый элемент"
            >
              +
            </div>
            <div className="mt-4 text-center text-neutral-500">
              Нажмите для добавления первого элемента
            </div>
          </div>
        ) : (
          // Отображаем организационную структуру
          <div className="org-tree">
            <OrganizationTree 
              orgUnits={orgUnits} 
              employees={employees}
              onAddUnit={handleAddClick}
            />
          </div>
        )}
        
        {/* Модальное окно добавления элемента */}
        <AddUnitModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          parentId={selectedParentId}
          onSuccess={handleAddSuccess}
        />
      </div>
    </DndProvider>
  );
}

// Временная заглушка, пока не реализован полноценный компонент
function OrganizationTree({ orgUnits, employees, onAddUnit }: any) {
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="text-lg mb-3">Организационная структура</h3>
      <p>Здесь будет отображаться дерево с {orgUnits.length} элементами и {employees.length} сотрудниками</p>
      <button 
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
        onClick={() => onAddUnit(null)}
      >
        Добавить элемент
      </button>
    </div>
  );
}