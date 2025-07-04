const SociusLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    className={className} // className sẽ được truyền từ TailwindCSS
  >
    <defs>
      <style>{`.cls-1{fill:currentColor;}`}</style>{" "}
      {/* Đặt màu fill theo currentColor */}
    </defs>
    <g id="Layer_2" data-name="Layer 2">
      <g id="Layer_1-2" data-name="Layer 1">
        <path
          className="cls-1"
          d="M3.71,16A3.72,3.72,0,0,1,0,12.29V7.43H7.41v4.86A3.71,3.71,0,0,1,3.71,16ZM1.14,8.57v3.72a2.57,2.57,0,0,0,5.13,0V8.57Z"
        />
        <path
          className="cls-1"
          d="M16,8.57H8.59V3.71a3.71,3.71,0,0,1,7.41,0ZM9.73,7.43h5.12V3.71a2.56,2.56,0,0,0-2.56-2.57A2.57,2.57,0,0,0,9.73,3.71Z"
        />
        <path
          className="cls-1"
          d="M3.05,6.77a3,3,0,1,1,3.05-3A3,3,0,0,1,3.05,6.77Zm0-4.95A1.91,1.91,0,1,0,5,3.73,1.92,1.92,0,0,0,3.05,1.82Z"
        />
        <path
          className="cls-1"
          d="M13,15.32A3.05,3.05,0,1,1,16,12.27,3.06,3.06,0,0,1,13,15.32Zm0-5a1.91,1.91,0,1,0,1.9,1.9A1.9,1.9,0,0,0,13,10.37Z"
        />
        <rect className="cls-1" x="8.59" y="8" width="1.14" height="7.43" />
        <rect className="cls-1" x="6.27" y="0.57" width="1.14" height="7.43" />
      </g>
    </g>
  </svg>
);

export default SociusLogo;
