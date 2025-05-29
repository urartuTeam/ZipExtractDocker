import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import OrgTree from './OrgTree';
import AddUnitModal from './AddUnitModal';
import { OrgUnit, entityTypes } from '@shared/schema';

export default function HRView() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { toast } = useToast();

  const { 
    data: orgUnits, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/org-units'],
    refetchOnWindowFocus: false,
  });

  const handleAddClick = (parentId: number | null = null) => {
    setSelectedParentId(parentId);
    setIsAddModalOpen(true);
  };

  const handleAddUnitSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
    toast({
      title: "Успешно",
      description: "Элемент успешно добавлен",
    });
  };

  // Check if there are any root org units
  const hasOrgUnits = orgUnits && orgUnits.some((unit: OrgUnit) => unit.parentId === null);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-400">Загрузка структуры...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-error">
          <div className="text-5xl mb-4">⚠️</div>
          <p>Ошибка загрузки организационной структуры</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded" 
            onClick={() => refetch()}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {!hasOrgUnits ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div 
              className="bg-neutral-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-neutral-200 transition-colors" 
              onClick={() => handleAddClick(null)}
            >
              <span className="material-icons text-5xl text-primary">add</span>
            </div>
            <p className="text-neutral-400 text-lg">Нажмите, чтобы создать организационную структуру</p>
          </div>
        </div>
      ) : (
        <OrgTree 
          orgUnits={orgUnits} 
          onAddUnit={handleAddClick} 
        />
      )}

      <AddUnitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        parentId={selectedParentId}
        onSuccess={handleAddUnitSuccess}
      />
    </div>
  );
}
