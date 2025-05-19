import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
export const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "hh:mm a | do MMMM, yyyy", { locale: enUS });
  };
