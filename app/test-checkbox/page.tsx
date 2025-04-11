"use client"

import { useState } from "react"
import { ThemeCheckbox } from "@/components/ui/theme-checkbox"

export default function TestCheckboxPage() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)
  const [checked4, setChecked4] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="archivo-font text-3xl mb-8">THEMED CHECKBOX VARIANTS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="archivo-font text-xl mb-4">PEAR VARIANT</h2>
          <div className="flex items-center space-x-4">
            <ThemeCheckbox 
              variant="pear" 
              checked={checked1}
              onCheckedChange={() => setChecked1(!checked1)}
              id="pear-checkbox"
            />
            <label htmlFor="pear-checkbox" className="text-lg cursor-pointer">
              Pear Checkbox
            </label>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="archivo-font text-xl mb-4">FERN VARIANT</h2>
          <div className="flex items-center space-x-4">
            <ThemeCheckbox 
              variant="fern" 
              checked={checked2}
              onCheckedChange={() => setChecked2(!checked2)}
              id="fern-checkbox"
            />
            <label htmlFor="fern-checkbox" className="text-lg cursor-pointer">
              Fern Checkbox
            </label>
          </div>
        </div>
        
        <div className="bg-black_olive p-6 rounded-lg shadow-md">
          <h2 className="archivo-font text-xl mb-4 text-eggshell">EGGSHELL VARIANT</h2>
          <div className="flex items-center space-x-4">
            <ThemeCheckbox 
              variant="eggshell" 
              checked={checked3}
              onCheckedChange={() => setChecked3(!checked3)}
              id="eggshell-checkbox"
            />
            <label htmlFor="eggshell-checkbox" className="text-lg text-eggshell cursor-pointer">
              Eggshell Checkbox
            </label>
          </div>
        </div>
        
        <div className="bg-eggshell p-6 rounded-lg shadow-md">
          <h2 className="archivo-font text-xl mb-4 text-black_olive">BLACK OLIVE VARIANT</h2>
          <div className="flex items-center space-x-4">
            <ThemeCheckbox 
              variant="blackolive" 
              checked={checked4}
              onCheckedChange={() => setChecked4(!checked4)}
              id="blackolive-checkbox"
            />
            <label htmlFor="blackolive-checkbox" className="text-lg text-black_olive cursor-pointer">
              Black Olive Checkbox
            </label>
          </div>
        </div>
      </div>
    </div>
  )
} 