import { useState, useEffect, useCallback } from 'react';
import { format, parse, isWithinInterval } from 'date-fns';
import { SchoolData, TIME_SLOTS_MORNING, TIME_SLOTS_AFTERNOON } from '../lib/data';

export const useNotifications = (
  selectedTurn: 'morning' | 'afternoon',
  selectedClass: string,
  selectedDay: string,
  schoolData: SchoolData
) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [lastNotifiedSlot, setLastNotifiedSlot] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // Fallback
      });
    }
  }, [permission]);

  useEffect(() => {
    if (permission !== 'granted') return;

    const checkSchedule = () => {
      const now = new Date();
      const timeSlots = selectedTurn === 'morning' ? TIME_SLOTS_MORNING : TIME_SLOTS_AFTERNOON;
      const currentTimeStr = format(now, 'HH:mm');
      const currentTime = parse(currentTimeStr, 'HH:mm', now);

      for (const slot of timeSlots) {
        const [startStr, endStr] = slot.split('–');
        const startTime = parse(startStr, 'HH:mm', now);
        const endTime = parse(endStr, 'HH:mm', now);

        // Notify at the exact start minute
        if (currentTimeStr === startStr && lastNotifiedSlot !== slot) {
          const isInterval = slot === '09:45–10:00' || slot === '15:15–15:30';
          const subject = schoolData[selectedTurn][selectedClass]?.[selectedDay]?.[slot];

          if (isInterval) {
            sendNotification('Intervalo Iniciado!', 'O intervalo começou. Aproveite para descansar!');
          } else if (subject) {
            sendNotification(
              'Nova Aula Começando!',
              `Sua aula de ${subject.name} (${subject.teacher}) está começando agora!`
            );
          }
          setLastNotifiedSlot(slot);
          break;
        }
      }
    };

    const interval = setInterval(checkSchedule, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [permission, selectedTurn, selectedClass, selectedDay, schoolData, lastNotifiedSlot, sendNotification]);

  return { permission, requestPermission };
};
