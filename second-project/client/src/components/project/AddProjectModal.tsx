import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const { toast } = useToast();
  
  // Create project mutation
  const createProject = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/projects', data),
    onSuccess: () => {
      resetForm();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать проект",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('active');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Ошибка",
        description: "Название проекта обязательно для заполнения",
        variant: "destructive",
      });
      return;
    }
    
    const projectData = {
      name,
      status,
      ...(description && { description }),
    };
    
    createProject.mutate(projectData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить проект</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Название проекта</Label>
            <Input 
              id="project-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Введите название проекта" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Описание</Label>
            <Textarea 
              id="project-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Краткое описание проекта" 
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-status">Статус</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="planning">Планирование</SelectItem>
                <SelectItem value="on-hold">Приостановлен</SelectItem>
                <SelectItem value="completed">Завершен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={createProject.isPending}
            >
              {createProject.isPending ? 'Создание...' : 'Создать проект'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
