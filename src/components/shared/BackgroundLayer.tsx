"use client";

import React from 'react';

/**
 * A dedicated fixed background layer.
 * Using 'background-attachment: fixed' on body causes full page repaints on scroll.
 * A separate fixed div with 'will-change: transform' allows the browser to composite
 * the background on a separate layer, significantly improving scroll performance.
 */
export default function BackgroundLayer() {
    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none will-change-transform translate-z-0"
            style={{
                backgroundColor: '#1a1a1a',
                backgroundImage: `
          linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)),
          url('/dark-titanium-bg.png')
        `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        />
    );
}
