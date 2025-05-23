import Image from 'next/image';
import { useState } from 'react';
type Connections = {
  [key: string]: boolean; // Service name as the key, and boolean for the connection status
};
export default function Apps() {
  // State for tracking connection status
  const [connections, setConnections] = useState<Connections>({
    quickbooks: true,
    xero: true,
    gmail: true
  });

  // Toggle connection status
  const toggleConnection = (service: string) => {
    setConnections(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <div className="w-full bg-[#191919] mt-16 rounded-xl py-8 px-8 relative min-h-screen">      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QuickBooks Card */}
        <div className="bg-[#FFFFFF0A] rounded-[20px] p-10 flex flex-col justify-between border-[0.2px] border-[#B0B0B0]">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-[56px] h-[41px] bg-transparent rounded-full flex items-center justify-center">
            <Image
                src="/QB.png"
                alt="Loading spinner"
                width={56}
                height={41}
                />
            </div>
            <div>
              <h3 className="text-white font-urbanist font-medium text-[14px] leading-[100%] tracking-[0%]">QuickBooks</h3>
              <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%]">quickbooks.com</p>
            </div>
          </div>

          <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%] mb-6">
            QuickBooks is an intuitive accounting software designed for businesses to manage finances,
            track expenses, and generate invoices efficiently.
          </p>

          <div className="flex justify-between items-center">
            <span className="text-[#F9DB6F] font-urbanist font-medium text-[15px] leading-[100%] tracking-[0%]">Connected</span>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${connections.quickbooks ? 'bg-[#F9DB6F] justify-end' : 'bg-gray-700 justify-start'}`}
              onClick={() => toggleConnection('quickbooks')}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Xero Card */}
        <div className="bg-[#FFFFFF0A] rounded-[20px] p-10 flex flex-col justify-between border-[0.2px] border-[#B0B0B0] ">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-[56px] h-[41px] bg-transparent rounded-full flex items-center justify-center">
            <Image
                src="/Xero.png"
                alt="Loading spinner"
                width={56}
                height={41}
                />
            </div>
            <div>
              <h3 className="text-white font-urbanist font-medium text-[14px] leading-[100%] tracking-[0%]">Xero</h3>
              <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%]">xero.com</p>
            </div>
          </div>

          <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%] mb-6">
            Xero is a cloud-based accounting software that helps businesses manage invoices, expenses,
            payroll, and bank reconciliation seamlessly.
          </p>

          <div className="flex justify-between items-center">
            <span className="text-[#F9DB6F] font-urbanist font-medium text-[15px] leading-[100%] tracking-[0%]">Connected</span>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${connections.xero ? 'bg-[#F9DB6F] justify-end' : 'bg-gray-700 justify-start'}`}
              onClick={() => toggleConnection('xero')}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Gmail Card */}
        <div className="bg-[#FFFFFF0A] rounded-[20px] p-10 flex flex-col justify-between border-[0.2px] border-[#B0B0B0]">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10  rounded-md flex items-center justify-center overflow-hidden">
              <div className="w-[56px] h-[41px] flex items-center justify-center bg-transparent text-white">
                <Image
                src="/Gmail.png"
                alt="Loading spinner"
                width={56}
                height={41}
                />
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium">Gmail</h3>
              <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%]">gmail.com</p>
            </div>
          </div>

          <p className="text-[#828282] font-urbanist font-normal text-[12px] leading-[100%] tracking-[0%] mb-6">
            Gmail is a secure and user-friendly email service by Google that offers powerful features like
            smart inbox organization, spam filtering, and seamless integration with Google Workspace.
          </p>

          <div className="flex justify-between items-center">
            <span className="text-[#F9DB6F] font-urbanist font-medium text-[15px] leading-[100%] tracking-[0%]">Connected</span>
            <button
              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${connections.gmail ? 'bg-[#F9DB6F] justify-end' : 'bg-gray-700 justify-start'}`}
              onClick={() => toggleConnection('gmail')}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}