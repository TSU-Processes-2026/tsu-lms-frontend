// Switch.tsx
import { useState } from 'react';

interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    colorSelected?: boolean;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    labelOnSelected?: string;
    labelOnDisabled?: string;
    labelPosition?: 'left' | 'right';
}

const sizeConfig = {
    sm: {
        switch: 'w-8 h-4',
        knob: 'w-3 h-3',
        translate: 'translate-x-4',
    },
    md: {
        switch: 'w-11 h-6',
        knob: 'w-5 h-5',
        translate: 'translate-x-5',
    },
    lg: {
        switch: 'w-14 h-7',
        knob: 'w-6 h-6',
        translate: 'translate-x-7',
    },
};

export const Switch = ({
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    label,
    labelOnSelected,
    labelOnDisabled,
    colorSelected = false,
    labelPosition = 'right',
}: SwitchProps) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleToggle = () => {
        if (disabled) return;

        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    const hasAnyLabel = (): boolean => {
        return label != undefined || labelOnSelected != undefined || labelOnDisabled != undefined;
    };

    const sizes = sizeConfig[size];

    return (
        <label
            className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            {hasAnyLabel() && labelPosition === 'left' && (
                <span
                    className={`text-md ${colorSelected ? (checked ? 'text-blue-400' : 'text-gray-300') : 'text-gray-300'}`}
                >
                    {checked ? labelOnSelected : labelOnDisabled}
                </span>
            )}

            <button
                type='button'
                role='switch'
                aria-checked={isChecked}
                disabled={disabled}
                onClick={handleToggle}
                className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          ${sizes.switch}
          ${isChecked ? 'bg-blue-600' : 'bg-gray-300'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        `}
            >
                <span
                    className={`
            inline-block bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
            ${sizes.knob}
            ${isChecked ? sizes.translate : 'translate-x-0.5'}
          `}
                />
            </button>

            {hasAnyLabel() && labelPosition === 'right' && (
                <span
                    className={`text-md font-medium ${colorSelected ? (checked ? 'text-blue-500' : 'text-gray-400') : 'text-gray-400'}`}
                >
                    {checked ? labelOnSelected : labelOnDisabled}
                </span>
            )}
        </label>
    );
};
