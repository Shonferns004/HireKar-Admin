import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AlertContext = createContext({
  showAlert: (_title, _message) => {},
});

export const useAppAlert = () => useContext(AlertContext);

export default function AppAlertProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
  });
  const originalAlertRef = useRef(window.alert);

  useEffect(() => {
    const showAlert = (title, message = "") => {
      const resolvedTitle = message ? title || "Notice" : "Notice";
      const resolvedMessage = message || title || "";

      setDialog({
        open: true,
        title: resolvedTitle,
        message: resolvedMessage,
      });
    };

    window.alert = (message) => showAlert("Notice", String(message ?? ""));

    return () => {
      window.alert = originalAlertRef.current;
    };
  }, []);

  const value = useMemo(
    () => ({
      showAlert: (title, message = "") =>
        setDialog({
          open: true,
          title: title || "Notice",
          message,
        }),
    }),
    [],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      {dialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.32),_transparent_36%),linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f1f5f9_100%)] px-6 pb-6 pt-5">
              <div className="inline-flex rounded-full bg-primary/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">
                HireKar Admin
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                {dialog.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                {dialog.message}
              </p>
              <button
                type="button"
                onClick={() => setDialog({ open: false, title: "", message: "" })}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
