import React, { useState, useRef, useEffect } from 'react';

interface TeamMember {
    userId: string;
    username: string;
}

interface MultipleSelectProps {
    members: TeamMember[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

import { createPortal } from 'react-dom';

export const MultipleSelect: React.FC<MultipleSelectProps> = ({
    members,
    selectedIds,
    onChange,
    placeholder = 'Выберите участников...',
    label,
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    useEffect(() => {
        if (isOpen) {
            updatePosition();

            const handleScroll = () => {
                updatePosition();
            };

            const handleResize = () => {
                updatePosition();
            };

            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [isOpen]);

    const isSelected = (userId: string) => selectedIds.includes(userId);

    const toggleMember = (userId: string) => {
        if (disabled) return;

        if (isSelected(userId)) {
            onChange(selectedIds.filter((id) => id !== userId));
        } else {
            onChange([...selectedIds, userId]);
        }
    };

    const removeSelected = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(selectedIds.filter((id) => id !== userId));
    };

    const selectedMembers = members.filter((member) => selectedIds.includes(member.userId));
    const dropdownContent =
        isOpen &&
        !disabled &&
        createPortal(
            <div
                className='fixed z-[1000] bg-white rounded-lg border border-gray-200 shadow-lg overflow-auto'
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    maxHeight: '300px',
                }}
            >
                {members.length === 0 ? (
                    <div className='px-4 py-3 text-sm text-gray-500 text-center'>
                        Нет доступных участников
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.userId}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                toggleMember(member.userId);
                            }}
                            className={`
                            flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm
                            hover:bg-gray-50 transition-colors
                            ${isSelected(member.userId) ? 'bg-blue-50' : ''}
                        `}
                        >
                            <div className='flex h-4 w-4 items-center justify-center'>
                                {isSelected(member.userId) ? (
                                    <svg
                                        className='h-4 w-4 text-blue-600'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M5 13l4 4L19 7'
                                        />
                                    </svg>
                                ) : (
                                    <div className='h-4 w-4 rounded border border-gray-300' />
                                )}
                            </div>
                            <div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600'>
                                {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span className='text-gray-900'>{member.username}</span>
                        </div>
                    ))
                )}
            </div>,
            document.body,
        );

    return (
        <div className='w-full' ref={containerRef}>
            {label && (
                <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
            )}

            <div ref={buttonRef}>
                <div
                    className={`
                        min-h-[42px] w-full rounded-lg border bg-white px-3 py-2
                        ${error ? 'border-red-500' : 'border-gray-300'}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                        transition-colors
                    `}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <div className='flex flex-wrap gap-1.5'>
                        {selectedMembers.map((member) => (
                            <span
                                key={member.userId}
                                className='inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800'
                            >
                                {member.username}
                                {!disabled && (
                                    <button
                                        type='button'
                                        onClick={(e) => removeSelected(member.userId, e)}
                                        className='ml-1 text-blue-600 hover:text-blue-800 focus:outline-none'
                                    >
                                        <svg
                                            className='h-3 w-3'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                )}
                            </span>
                        ))}
                        {selectedMembers.length === 0 && (
                            <span className='text-gray-400 text-sm py-1'>{placeholder}</span>
                        )}
                    </div>
                </div>
            </div>

            {dropdownContent}

            {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
        </div>
    );
};
