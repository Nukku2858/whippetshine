const WhippetLogo = ({ className = "", ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg
    viewBox="0 0 200 120"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M180 45c-3-8-10-14-18-16-4-1-8 0-12 2l-8 6c-4 3-9 4-14 3l-18-5c-6-2-12-1-17 2l-14 10c-5 3-10 5-16 5H48c-5 0-10-2-14-5L22 36c-3-3-7-4-11-3-4 2-7 5-8 9l-2 12c-1 5 0 10 3 14l8 12c3 4 4 9 3 14l-2 8c-1 3 1 6 4 6h8c3 0 5-2 6-5l2-8c1-4 4-7 8-8l12-3c4-1 8 0 11 3l6 8c2 3 6 5 10 5h6c3 0 6-2 7-5l3-10c1-4 4-7 8-8l16-4c5-1 10-1 15 1l12 5c4 2 8 1 11-2l10-10c4-4 6-9 6-15v-4c0-3-1-5-3-7l-2-2z" />
  </svg>
);

export default WhippetLogo;
