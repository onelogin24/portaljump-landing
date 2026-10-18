import type { SVGProps } from "react";

// lucide-react 1.x no longer ships brand logos. Instagram and LinkedIn are the outlines lucide used to ship (ISC license);
// X follows the Tabler Icons brand-x outline (MIT license), which uses the same 24px stroke grid.
type Props = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function Icon({ size = 18, strokeWidth = 1.75, children, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function InstagramIcon(props: Props) {
  return (
    <Icon {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </Icon>
  );
}

export function XIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768" />
      <path d="M13.232 10.768l6.768 -6.768" />
    </Icon>
  );
}

export function LinkedinIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Icon>
  );
}
