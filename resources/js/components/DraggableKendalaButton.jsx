import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function DraggableKendalaButton({ href = '/kendala' }) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialPosRef = useRef({ x: 0, y: 0 });
    const hasDraggedRef = useRef(false);

    // Dapatkan posisi default atau dari localStorage
    useEffect(() => {
        const savedPos = localStorage.getItem('kendala_button_position');
        const defaultX = Math.max(16, window.innerWidth - 240);
        const defaultY = Math.max(16, window.innerHeight - 90);

        if (savedPos) {
            try {
                const parsed = JSON.parse(savedPos);
                const clampedX = Math.min(Math.max(12, parsed.x), window.innerWidth - 180);
                const clampedY = Math.min(Math.max(12, parsed.y), window.innerHeight - 70);
                setPosition({ x: clampedX, y: clampedY });
                return;
            } catch (e) {
                // Fail-safe to default position
            }
        }
        setPosition({ x: defaultX, y: defaultY });
    }, []);

    // Simpan posisi terbaru ke localStorage
    const savePosition = (pos) => {
        if (pos) {
            localStorage.setItem('kendala_button_position', JSON.stringify(pos));
        }
    };

    // Handler mulai drag (mouse & touch)
    const handleStart = (clientX, clientY) => {
        if (!buttonRef.current || !position) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        setIsDragging(true);

        dragStartRef.current = { x: clientX, y: clientY };
        initialPosRef.current = { x: position.x, y: position.y };
    };

    const onMouseDown = (e) => {
        if (e.button !== 0) return; // Hanya klik kiri
        handleStart(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    useEffect(() => {
        const handleMove = (clientX, clientY) => {
            if (!isDraggingRef.current || !buttonRef.current) return;

            const deltaX = clientX - dragStartRef.current.x;
            const deltaY = clientY - dragStartRef.current.y;

            if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
                hasDraggedRef.current = true;
            }

            const rect = buttonRef.current.getBoundingClientRect();
            const newX = initialPosRef.current.x + deltaX;
            const newY = initialPosRef.current.y + deltaY;

            // Batasi posisi agar tidak keluar dari viewport layar
            const clampedX = Math.min(Math.max(8, newX), window.innerWidth - rect.width - 8);
            const clampedY = Math.min(Math.max(8, newY), window.innerHeight - rect.height - 8);

            const nextPos = { x: clampedX, y: clampedY };
            setPosition(nextPos);
        };

        const onMouseMove = (e) => {
            if (isDraggingRef.current) {
                e.preventDefault();
                handleMove(e.clientX, e.clientY);
            }
        };

        const onTouchMove = (e) => {
            if (isDraggingRef.current && e.touches.length === 1) {
                e.preventDefault(); // Hindari scroll layar HP saat menggeser tombol
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleEnd = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                setIsDragging(false);
                if (position) {
                    savePosition(position);
                }
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);
        };
    }, [position]);

    const handleClick = (e) => {
        if (hasDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        router.visit(href);
    };

    if (!position) return null;

    return (
        <div
            ref={buttonRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none',
                userSelect: 'none',
                zIndex: 9999,
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onClick={handleClick}
            className={`group cursor-grab active:cursor-grabbing transition-transform ${
                isDragging ? 'scale-105 opacity-95' : 'hover:scale-102'
            }`}
            title="Tahan & geser untuk memindahkan posisi tombol"
        >
            <div className="bg-[#E51C77] text-white font-black text-xs md:text-sm py-3.5 px-6 rounded-full uppercase tracking-[0.15em] flex items-center gap-2.5 shadow-2xl shadow-pink-500/50 hover:bg-pink-600 transition-all border-2 border-white/50 backdrop-blur-md">
                <span className="text-white/60 text-xs font-mono tracking-tighter select-none">
                    ⋮⋮
                </span>
                <span>Lintasan Kendala</span>
                <span className="bg-amber-400 text-amber-900 rounded-sm w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-[12px] font-black transform rotate-45 shadow-inner">
                    !
                </span>
            </div>
        </div>
    );
}
