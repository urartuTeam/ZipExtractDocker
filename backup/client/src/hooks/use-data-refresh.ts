import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Хук для автоматического обновления данных через заданные интервалы.
 * Используйте его в административной панели для обеспечения актуальности данных.
 * 
 * @param queryKeys Массив ключей запросов для обновления
 * @param interval Интервал в миллисекундах (по умолчанию 5000 мс)
 */
export function useDataRefresh(queryKeys: string[], interval: number = 5000) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Функция для обновления всех указанных запросов
    const refreshQueries = () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    };
    
    // Устанавливаем интервал для регулярного обновления данных
    const intervalId = setInterval(refreshQueries, interval);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [queryClient, queryKeys, interval]);
}