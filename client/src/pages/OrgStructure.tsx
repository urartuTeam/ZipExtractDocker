import React from 'react';
import OrgFlowTree from '@/components/OrgFlowTree';

export default function OrgStructure() {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6 mt-5">
        <h1 className="text-2xl font-bold">Структура связей сотрудников</h1>
      </div>
      <div className="h-[calc(100vh-120px)]">
        <OrgFlowTree />
      </div>
    </div>
  );
}