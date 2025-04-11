"use client"

import React, { forwardRef } from 'react';
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils"
import "./neon-checkbox.css"

interface ThemeCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: 'pear' | 'fern' | 'eggshell' | 'blackolive';
}

const ThemeCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  ThemeCheckboxProps
>(({ className, variant = 'pear', ...props }, ref) => (
  <div className={`neon-checkbox-wrapper ${variant}`}>
    <label className={`neon-checkbox ${variant}`}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn("sr-only", className)}
        {...props}
      />
      <div className="neon-checkbox__frame">
        <div className="neon-checkbox__box">
          <div className="neon-checkbox__check-container">
            <svg viewBox="0 0 24 24" className="neon-checkbox__check">
              <path d="M3,12.5l7,7L21,5" />
            </svg>
          </div>
          <div className="neon-checkbox__glow" />
          <div className="neon-checkbox__borders">
            <span /><span /><span /><span />
          </div>
        </div>
        <div className="neon-checkbox__effects">
          <div className="neon-checkbox__particles">
            <span /><span /><span /><span />
            <span /><span /><span /><span />
            <span /><span /><span /><span />
          </div>
          <div className="neon-checkbox__rings">
            <div className="ring" />
            <div className="ring" />
            <div className="ring" />
          </div>
          <div className="neon-checkbox__sparks">
            <span /><span /><span /><span />
          </div>
        </div>
      </div>
    </label>
  </div>
));

ThemeCheckbox.displayName = "ThemeCheckbox";

export { ThemeCheckbox }; 