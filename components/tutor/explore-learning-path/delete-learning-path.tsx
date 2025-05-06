"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function DeleteLearningPath({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Learning Path",
  message = "Do you want to delete the learning path?",
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] w-full max-w-md rounded-lg shadow-lg overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-medium">{title}</h2>
          <Button onClick={onClose} className="text-white bg-transparent hover:bg-transparent hover:text-gray-300">
            <X size={24} className="text-[#f0d568]" />
          </Button>
        </div>

        <div className="mb-8">
          <p className="text-[#f0d568] text-lg">{message}</p>
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-[#333333] hover:bg-[#444444] text-white border-0 rounded-md py-2 h-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-auto"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
