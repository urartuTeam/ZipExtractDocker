import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  positionId: number | null;
  departmentId: number | null;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  positionId,
  departmentId,
  onSuccess,
}: AddEmployeeModalProps) {
  const [fullName, setfullName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  // Get manager based on department
  const { data: departmentData } = useQuery({
    queryKey: [`/api/org-units/${departmentId}`],
    enabled: !!departmentId,
  });

  const managerId = departmentData?.headEmployeeId || null;

  // Create employee mutation
  const createEmployee = useMutation({
    mutationFn: (data: any) => apiRequest("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      resetForm();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сотрудника",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setfullName("");
    setMiddleName("");
    setEmail("");
    setPhone("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName) {
      toast({
        title: "Ошибка",
        description: "Имя и фамилия обязательны для заполнения",
        variant: "destructive",
      });
      return;
    }

    const employeeData: any = {
      fullName,
      positionId,
      departmentId,
    };

    if (middleName) employeeData.middleName = middleName;
    if (email) employeeData.email = email;
    if (phone) employeeData.phone = phone;
    if (managerId) employeeData.managerId = managerId;

    createEmployee.mutate(employeeData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">ФИО</Label>
            <Input
              id="first-name"
              value={fullName}
              onChange={(e) => setfullName(e.target.value)}
              placeholder="Имя"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="middle-name">Отчество</Label>
            <Input
              id="middle-name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Отчество (если есть)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={createEmployee.isPending}>
              {createEmployee.isPending ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
