export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M9 16.5h6.2l1.4 2.3h5.9"
        className="stroke-primary-fg"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12.2" cy="21.4" r="1.7" className="stroke-primary-fg" strokeWidth="1.8" />
      <circle cx="21.4" cy="21.4" r="1.7" className="stroke-primary-fg" strokeWidth="1.8" />
      <path
        d="M11.2 10.2 13 13.4h3.4L14.6 10.2h-3.4Z"
        className="stroke-primary-fg"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 9.4v4.6M17.2 11.7h4"
        className="stroke-primary-fg"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
