"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface SearchInputProps {
  onChange: (value: string) => void
  placeholder?: string
  onFocus?: () => void
  onClose?: () => void
  value?: string
}

export default function SearchInput({
  onChange,
  placeholder = "Search",
  onFocus,
  onClose,
  value = "",
}: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleOpen = () => {
    setIsOpen(true)
    onFocus?.()
  }

  const handleClose = () => {
    setIsOpen(false)
    setInputValue("")
    onChange("")
    onClose?.()
  }

  // Use setTimeout to delay the blur event, allowing clicks to register first
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the blur is happening because user clicked outside the entire search container
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        // Only close if the input is empty or if explicitly requested
        if (!inputValue.trim()) {
          handleClose()
        }
      }
    }, 150) // Small delay to allow click events to register
  }

  const handleClear = () => {
    setInputValue("")
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="flex items-center">
      {isOpen ? (
        <div className="flex items-center border border-zinc-700 rounded-full px-4 py-2 w-64 transition-all duration-200 bg-zinc-900/50 backdrop-blur-sm">
          <Search className="w-4 h-4 text-white mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            className="bg-transparent outline-none text-white placeholder-zinc-400 w-full text-sm h-[44px]"
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {/* {inputValue && (
            <button
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-zinc-700 rounded-full transition-colors"
              type="button"
            >
              <X className="w-3 h-3 text-zinc-400 hover:text-white" />
            </button>
          )} */}
          <button
            onClick={handleClose}
            className="ml-1 p-1 hover:bg-zinc-700 rounded-full transition-colors"
            type="button"
          >
            <X className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="p-2 md:p-4 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
          type="button"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  )
}
