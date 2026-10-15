import { useEffect, useRef, useState, type ReactNode } from "react";

type ResponsiveDetailsProps = {
  children: ReactNode;
  onClose: () => void;
};

const ResponsiveDetails = ({ children, onClose }: ResponsiveDetailsProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isCompact, setIsCompact] = useState(
    () => window.matchMedia("(max-width: 1023px)").matches,
  );

  // Watch for changes between mobile/tablet and desktop.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompact(event.matches);
    };

    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, []);

  // Open a native modal on phones and tablets.

  useEffect(() => {
    if (!isCompact) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const body = document.body;
    const html = document.documentElement;

    // Remember the user's current position.
    const scrollY = window.scrollY;

    // Preserve existing styles so we can restore them.
    const previousStyles = {
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    // Open the modal.
    if (!dialog.open) {
      dialog.showModal();
    }

    // Lock the background page.
    html.style.overflow = "hidden";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      // Close the dialog during cleanup.
      if (dialog.open) {
        dialog.close();
      }

      // Restore the original page styles.
      html.style.overflow = previousStyles.htmlOverflow;

      body.style.position = previousStyles.bodyPosition;
      body.style.top = previousStyles.bodyTop;
      body.style.left = previousStyles.bodyLeft;
      body.style.right = previousStyles.bodyRight;
      body.style.width = previousStyles.bodyWidth;

      // Return to the original scroll position.
      window.scrollTo(0, scrollY);
    };
  }, [isCompact]);

  const content = (
    <>
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 py-3">
        <h2 className="text-base font-semibold text-slate-900">
          Request details
        </h2>

        <button
          type="button"
          onClick={onClose}
          autoFocus={isCompact}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Close
        </button>
      </div>

      {children}
    </>
  );

  if (isCompact) {
    return (
      <dialog
        ref={dialogRef}
        aria-label="Request details"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-full overflow-y-auto overscroll-contain bg-slate-50 p-4 text-slate-900 shadow-xl backdrop:bg-slate-950/50 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[38rem] sm:max-w-full sm:border-l sm:border-slate-200 sm:p-6"
      >
        {content}
      </dialog>
    );
  }

  return (
    <aside
      aria-label="Request details"
      className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
    >
      {content}
    </aside>
  );
};

export default ResponsiveDetails;
