import React, { useState } from 'react'
import { Button } from '../ui/button'
import Leavefeedback from './sessionsummary/leave-feedback'
import { Send } from 'lucide-react'
export default function SessionSummary() {
  const [ShowleaveFeedback, setShowLeaveFeedback] = useState(false)
  return (
    <div className='h-full relative '>
      <div className="h-[446px] flex flex-col items-center justify-center text-center border border-dashed border-white rounded-[20px]">
        <div className="flex flex-col text-white  px-8 py-6 w-full max-w-[700px] mx-auto">
          <h2 className="font-urbanist font-medium text-[36px] leading-[100%] tracking-[0]  mb-4 text-center">Session Summary</h2>

          <p className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center mb-6 text-white/80">
            Great job on today&apos;s questions – you&apos;re a Rockstar!
          </p>


          <div className="text-sm text-white/90 space-y-2 font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center mb-6">
            <p><span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">Learning Path:</span> Internal Policies - CX</p>
            <p><span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">Total Questions:</span> 5</p>
            <p><span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">Score for today:</span> 4/5</p>
            <p><span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">Question 1:</span> Correct</p>
            <p><span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">Question 2:</span> Incorrect</p>
            <p>
              The warranty policy consists of 24-month coverage. <br />
              Please review the related <span className="text-[#F9DB6F] font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-centerunderline cursor-pointer">Warranty card</span>.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button className="bg-[#F9DB6F] h-[48px] w-[194px] text-black hover:bg-[#f8d44e] font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] px-6 py-2 rounded-[8px]">
              Continue
            </Button>
            <Button variant="outline" className="border h-[48px] w-[194px] border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] px-6 py-2  rounded-[8px]" onClick={() => setShowLeaveFeedback(!ShowleaveFeedback)}>
              End Session
            </Button>
          </div>



          {ShowleaveFeedback && <Leavefeedback />}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 ">
        <div className="relative flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter your text here"
            className="w-full h-[58px] bg-[#0E0F11] border border-gray-700 rounded-[20px] py-3 px-4 pr-14 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <div className="w-10 h-10 rounded-full bg-[#F9DB6F] flex items-center justify-center cursor-pointer">
            <Send className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  )
}
