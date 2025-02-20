import "../styles/components/Loading.scss";

const Loading = () => {
    return (
      <svg className="pl" viewBox="0 0 32 32" width="32px" height="32px">
        <defs>
          <clipPath id="ring-clip">
            <polygon points="1 0,32 0,32 32,0 32,0 0,14 16.1,0 16.1" />
          </clipPath>
        </defs>
        <g fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(90,16,16)">
          <g opacity="0.2">
            <circle r="3" cx="6.5" cy="16" strokeDasharray="14.737 0" />
            <circle r="9.5" cx="19" cy="16" clipPath="url(#ring-clip)" />
          </g>
          <g strokeLinecap="round">
            <circle className="pl__worm1" r="3" cx="6.5" cy="16" strokeDasharray="14.137 64.4" />
            <circle
              className="pl__worm2"
              r="9.5"
              cx="19"
              cy="16"
              strokeDasharray="15.137 64.4"
              strokeDashoffset="14.137"
              transform="rotate(180,19,16)"
            />
          </g>
        </g>
      </svg>
    );
  };
  
  export default Loading;
  