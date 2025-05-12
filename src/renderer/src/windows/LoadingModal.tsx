// components/LoadingModal.tsx
import React from 'react'

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="loader mb-4"></div>
        <p className="text-lg font-medium">Đang tải bản cập nhật...</p>
      </div>
    </div>
  )
}

export default LoadingModal
