interface StatusTagProps {
  status: string;
  children?: React.ReactNode;
}

export default function StatusTag({ status, children }: StatusTagProps) {
  return (
    <span className={`status-tag status-${status}`}>
      {children ?? status}
    </span>
  );
}
