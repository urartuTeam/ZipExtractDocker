import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface PhotoUploadProps {
    employeeId: number;
    photoUrl: string | null;
    onPhotoUploaded: (url: string) => void;
    className?: string;
}

export function PhotoUpload({ employeeId, photoUrl, onPhotoUploaded, className = "" }: PhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверка типа файла
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Неверный формат файла",
                description: "Поддерживаются только изображения форматов JPEG, PNG, GIF и WebP.",
                variant: "destructive"
            });
            return;
        }

        // Проверка размера файла (макс. 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast({
                title: "Слишком большой файл",
                description: "Размер фото не должен превышать 5MB.",
                variant: "destructive"
            });
            return;
        }

        // Начинаем загрузку
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch(`/api/upload/employee-photo/${employeeId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка при загрузке фото");
            }

            const data = await response.json();

            // Обновляем превью и передаем URL обратно через callback
            setPreviewUrl(data.data.photo_url);
            onPhotoUploaded(data.data.photo_url);

            toast({
                title: "Фото загружено",
                description: "Фотография сотрудника успешно обновлена"
            });
        } catch (error) {
            toast({
                title: "Ошибка при загрузке фото",
                description: error instanceof Error ? error.message : "Неизвестная ошибка",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!employeeId) return;

        try {
            setIsUploading(true);
            const response = await fetch(`/api/upload/employee-photo/${employeeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка при удалении фото");
            }

            setPreviewUrl(null);
            onPhotoUploaded("");

            toast({
                title: "Фото удалено",
                description: "Фотография сотрудника успешно удалена"
            });
        } catch (error) {
            toast({
                title: "Ошибка при удалении фото",
                description: error instanceof Error ? error.message : "Неизвестная ошибка",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className={`flex flex-col items-center space-y-3 ${className}`}>
            <Avatar className="w-32 h-32 border shadow-sm">
                {previewUrl ? (
                    <AvatarImage src={previewUrl} alt="Фото сотрудника" />
                ) : (
                    <AvatarFallback className="text-2xl bg-primary/10">
                        {employeeId ? getInitials("ФИ") : "ФИ"}
                    </AvatarFallback>
                )}
            </Avatar>

            <div className="flex space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? "Загрузка..." : "Загрузить фото"}
                </Button>

                {previewUrl && (
                    <Button
                        type="button"
                        variant="outline"

                        size="sm"
                        onClick={handleDeletePhoto}
                        disabled={isUploading}
                    >
                        Удалить
                    </Button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}