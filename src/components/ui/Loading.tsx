import React from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
  return (
    <div className='flex w-full h-full grow flex-col flex-1 py-20 items-center justify-center'>
      <AiOutlineLoading3Quarters className='animate-spin size-20 text-[#e51837]' />
    </div>
  )
}
