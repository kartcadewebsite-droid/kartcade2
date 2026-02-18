import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import '../styles/calendar-picker.css';

interface CalendarPickerProps {
    selectedDate: Date | null;
    onDateChange: (date: Date) => void;
    minDate: Date;
    maxDate: Date;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
    selectedDate,
    onDateChange,
    minDate,
    maxDate
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // ✅ PROPHETIC FIX: Close modal whenever selectedDate changes from parent or internal select
    useEffect(() => {
        if (isOpen) {
            setIsOpen(false);
        }
    }, [selectedDate]);

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return 'Select a date';

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div className="calendar-picker-wrapper">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="calendar-trigger-button"
            >
                <CalendarIcon className="w-5 h-5" />
                <span className="flex-1 text-left">
                    {formatDisplayDate(selectedDate)}
                </span>
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="calendar-backdrop"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Calendar Modal */}
                    <div className="calendar-modal">
                        <div className="calendar-modal-header">
                            <CalendarIcon className="w-5 h-5 text-[#2D9E49]" />
                            <h3 className="font-display text-lg font-bold uppercase text-white">
                                Select Date
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <DatePicker
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) {
                                    onDateChange(date);
                                    setIsOpen(false);
                                }
                            }}
                            onChange={(date) => {
                                if (date) onDateChange(date);
                            }}
                            minDate={minDate}
                            maxDate={maxDate}
                            inline
                            calendarClassName="kartcade-calendar"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default CalendarPicker;
