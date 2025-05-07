import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface DisplaySettingsProps {
  showThreeLevels: boolean;
  showVacancies: boolean;
  onShowThreeLevelsChange: (value: boolean) => void;
  onShowVacanciesChange: (value: boolean) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  showThreeLevels,
  showVacancies,
  onShowThreeLevelsChange,
  onShowVacanciesChange
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>Настройки отображения</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-three-levels" 
              checked={showThreeLevels}
              onCheckedChange={(checked) => {
                onShowThreeLevelsChange(checked === true);
              }}
            />
            <Label htmlFor="show-three-levels" className="cursor-pointer">
              Отображать 3 уровня дерева
            </Label>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-vacancies"
              checked={showVacancies}
              onCheckedChange={(checked) => {
                onShowVacanciesChange(checked === true);
              }}
            />
            <Label htmlFor="show-vacancies" className="cursor-pointer">
              Отображать количество вакансий
            </Label>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DisplaySettings;