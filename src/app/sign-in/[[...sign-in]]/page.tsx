import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        background:     "var(--bg)",
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "40px 24px",
      }}
    >
      <SignIn
        appearance={{
          variables: {
            colorPrimary:    "#e8a838",
            colorBackground: "var(--surface)",
            colorText:       "var(--text)",
            borderRadius:    "12px",
          },
          elements: {
            card:            "shadow-none",
            socialButtonsBlockButton:
              "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]",
          },
        }}
      />
    </div>
  );
}
