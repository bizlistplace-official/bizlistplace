import React from 'react';
import { MapPin } from 'lucide-react';

export function WorldMapIllustration() {
  return (
    <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center overflow-hidden">
      {/* Light blue vector world map silhouette */}
      <svg
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-35 text-[#93C5FD]"
      >
        {/* Simplified high quality global landmass paths */}
        {/* North America */}
        <path
          d="M150,90 C170,70 210,65 260,80 C290,90 320,80 340,95 C360,110 330,150 310,180 C290,210 260,220 230,210 C200,200 180,180 160,150 Z"
          fill="currentColor"
        />
        <path
          d="M120,120 C140,110 160,130 150,160 C130,170 110,150 120,120 Z"
          fill="currentColor"
        />
        <path
          d="M210,210 C230,220 240,250 220,270 C200,280 190,250 200,220 Z"
          fill="currentColor"
        />
        {/* Greenland */}
        <path
          d="M360,40 C390,30 420,40 410,70 C390,90 370,80 360,60 Z"
          fill="currentColor"
        />
        {/* South America */}
        <path
          d="M260,290 C290,290 330,320 340,360 C350,400 320,450 290,470 C270,470 260,430 250,380 C240,340 240,310 260,290 Z"
          fill="currentColor"
        />
        {/* Europe */}
        <path
          d="M480,90 C520,80 550,95 560,130 C540,160 510,165 480,150 C460,140 460,110 480,90 Z"
          fill="currentColor"
        />
        <path
          d="M450,110 C465,100 475,120 465,135 C450,140 440,125 450,110 Z"
          fill="currentColor"
        />
        {/* Africa */}
        <path
          d="M480,180 C520,170 560,190 580,230 C600,280 580,350 550,380 C520,400 490,360 480,310 C470,260 460,210 480,180 Z"
          fill="currentColor"
        />
        <path
          d="M600,320 C610,320 620,340 610,360 C600,360 590,340 600,320 Z"
          fill="currentColor"
        />
        {/* Asia */}
        <path
          d="M580,80 C650,60 740,70 820,90 C850,120 830,170 800,200 C750,220 700,210 650,200 C600,190 580,150 580,120 Z"
          fill="currentColor"
        />
        <path
          d="M680,210 C720,210 750,250 730,290 C700,300 670,270 680,230 Z"
          fill="currentColor"
        />
        <path
          d="M770,220 C810,230 830,270 810,300 C780,300 760,260 770,220 Z"
          fill="currentColor"
        />
        {/* Japan */}
        <path
          d="M870,140 C880,140 890,170 875,190 C865,190 860,165 870,140 Z"
          fill="currentColor"
        />
        {/* Australia */}
        <path
          d="M800,350 C850,340 900,360 910,400 C900,440 850,455 810,440 C780,420 780,370 800,350 Z"
          fill="currentColor"
        />
        <path
          d="M930,420 C940,420 945,445 935,455 C925,450 925,430 930,420 Z"
          fill="currentColor"
        />
      </svg>

      {/* Pulsing Pin Markers matching the reference image locations */}
      {/* 1. North America (New York) */}
      <div className="absolute top-[28%] left-[24%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping" />
          <div className="w-7 h-7 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* 2. South America (Brazil) */}
      <div className="absolute top-[68%] left-[28%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-7 h-7 rounded-full bg-blue-500/25 animate-ping delay-300" />
          <div className="w-6 h-6 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>
      </div>

      {/* 3. Europe (London / Paris) */}
      <div className="absolute top-[22%] left-[51%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping delay-500" />
          <div className="w-7 h-7 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* 4. Africa (Nigeria / Kenya) */}
      <div className="absolute top-[48%] left-[54%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-6 h-6 rounded-full bg-blue-500/20 animate-ping delay-700" />
          <div className="w-6 h-6 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>
      </div>

      {/* 5. East Asia (Tokyo / Singapore) */}
      <div className="absolute top-[25%] left-[78%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping delay-200" />
          <div className="w-7 h-7 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* 6. Australia (Sydney) */}
      <div className="absolute top-[75%] left-[84%] group">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-7 h-7 rounded-full bg-blue-500/25 animate-ping delay-400" />
          <div className="w-6 h-6 rounded-full bg-[#1D68F2] text-white flex items-center justify-center shadow-md shadow-blue-500/30 transform transition-transform group-hover:scale-125 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
