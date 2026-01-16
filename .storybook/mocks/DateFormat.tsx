// Mock for @redhat-cloud-services/frontend-components/DateFormat
import React from 'react';

interface DateFormatProps {
  date: number | Date | string;
  extraTitle?: string;
  type?: 'exact' | 'relative' | 'onlyDate';
}

export const DateFormat: React.FC<DateFormatProps> = ({ date }) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return <span>{dateObj.toLocaleString()}</span>;
};

export default DateFormat;
